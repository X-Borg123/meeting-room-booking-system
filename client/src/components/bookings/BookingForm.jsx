import { useEffect, useState } from 'react'
import { addMinutes, format, isBefore, startOfDay } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookingSchema } from '../../lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import TimeWheelPopover from './TimeWheelPopover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, CalendarDays } from 'lucide-react'
import {
  DEFAULT_START_TIME_VALUE,
  TIME_SLOT_INTERVAL_MINUTES,
  getDefaultEndDateTime,
  getSuggestedDateTime,
  getTimeValue,
  mergeDateAndTime,
  roundUpToInterval,
} from '@/lib/bookingDateTime'

const DEFAULT_FORM_VALUES = {
  title: '',
  startTime: undefined,
  endTime: undefined,
}

const BookingForm = ({ onSubmit, loading }) => {
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState('')
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)
  const [draftStartDate, setDraftStartDate] = useState(null)
  const [draftEndDate, setDraftEndDate] = useState(null)

  const {
    clearErrors,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  })

  const startDateTime = watch('startTime')
  const endDateTime = watch('endTime')
  const today = startOfDay(new Date())
  const minimumStartDateTime = roundUpToInterval(new Date())

  useEffect(() => {
    register('startTime')
    register('endTime')
  }, [register])

  useEffect(() => {
    if (!startDateTime && endDateTime) {
      setValue('endTime', undefined, { shouldDirty: true, shouldTouch: true })
      clearErrors('endTime')
      return
    }

    if (startDateTime && endDateTime && endDateTime <= startDateTime) {
      setValue('endTime', undefined, { shouldDirty: true, shouldTouch: true })
      clearErrors('endTime')
    }
  }, [clearErrors, endDateTime, setValue, startDateTime])

  const minimumEndDateTime = startDateTime
    ? addMinutes(startDateTime, TIME_SLOT_INTERVAL_MINUTES)
    : null

  const updateDateTimeField = (field, value) => {
    setValue(field, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
    clearErrors(field)
    setServerError('')
  }

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen)

    if (!nextOpen) {
      setServerError('')
      setStartDateOpen(false)
      setEndDateOpen(false)
      setDraftStartDate(null)
      setDraftEndDate(null)
      reset(DEFAULT_FORM_VALUES)
    }
  }

  const handleStartDateSelect = (date) => {
    if (!date) {
      return
    }

    const nextStartTime = getSuggestedDateTime({
      day: date,
      currentDateTime: startDateTime,
      minimumDateTime: minimumStartDateTime,
      fallbackTimeValue: DEFAULT_START_TIME_VALUE,
    })

    updateDateTimeField('startTime', nextStartTime)
  }

  const handleStartTimeChange = (timeValue) => {
    if (!startDateTime) {
      return
    }

    updateDateTimeField('startTime', mergeDateAndTime(startDateTime, timeValue))
  }

  const handleEndDateSelect = (date) => {
    if (!date || !startDateTime) {
      return
    }

    const nextEndTime = getSuggestedDateTime({
      day: date,
      currentDateTime: endDateTime,
      minimumDateTime: minimumEndDateTime,
      fallbackTimeValue: getTimeValue(getDefaultEndDateTime(startDateTime)),
    })

    updateDateTimeField('endTime', nextEndTime)
  }

  const handleEndTimeChange = (timeValue) => {
    if (!endDateTime) {
      return
    }

    updateDateTimeField('endTime', mergeDateAndTime(endDateTime, timeValue))
  }

  const handleStartDatePopoverChange = (nextOpen) => {
    setStartDateOpen(nextOpen)

    if (nextOpen) {
      setDraftStartDate(startDateTime ?? minimumStartDateTime)
    } else {
      setDraftStartDate(null)
    }
  }

  const handleEndDatePopoverChange = (nextOpen) => {
    setEndDateOpen(nextOpen)

    if (nextOpen) {
      setDraftEndDate(endDateTime ?? minimumEndDateTime ?? startDateTime)
    } else {
      setDraftEndDate(null)
    }
  }

  const handleSaveStartDate = () => {
    if (draftStartDate) {
      handleStartDateSelect(draftStartDate)
    }

    setStartDateOpen(false)
  }

  const handleSaveEndDate = () => {
    if (draftEndDate) {
      handleEndDateSelect(draftEndDate)
    }

    setEndDateOpen(false)
  }

  const onFormSubmit = async (data) => {
    setServerError('')
    try {
      await onSubmit({
        ...data,
        startTime: data.startTime.toISOString(),
        endTime: data.endTime.toISOString(),
      })
      reset(DEFAULT_FORM_VALUES)
      setOpen(false)
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create booking')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="shrink-0 whitespace-nowrap">
          <Plus size={16} className="mr-1" /> New Booking
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="mt-2 space-y-5">
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">
              Meeting Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Sprint Planning"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>
                  Start Time <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-slate-500">
                  Past dates and past time slots are disabled.
                </p>
              </div>

              <Popover open={startDateOpen} onOpenChange={handleStartDatePopoverChange}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      type="button"
                      className="h-12 w-full justify-between px-4 text-left font-medium"
                    />
                  }
                >
                  <span className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-slate-500" />
                    {startDateTime
                      ? format(startDateTime, 'EEE, MMM d, yyyy')
                      : 'Choose a start date'}
                  </span>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" className="w-auto space-y-3 p-4">
                  <Calendar
                    mode="single"
                    selected={draftStartDate ?? startDateTime}
                    onSelect={setDraftStartDate}
                    disabled={(date) => isBefore(date, today)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStartDateOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSaveStartDate}
                      disabled={!draftStartDate}
                    >
                      Save
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <TimeWheelPopover
                value={startDateTime}
                minimumDateTime={minimumStartDateTime}
                onChange={(nextValue) => handleStartTimeChange(format(nextValue, 'HH:mm'))}
                disabled={!startDateTime}
                placeholder="Choose a start time"
              />

              {errors.startTime && (
                <p className="text-xs text-red-500">{errors.startTime.message}</p>
              )}
            </div>

            {startDateTime ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>
                    End Time <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-slate-500">
                    Only dates and times after the start time are available.
                  </p>
                </div>

                <Popover open={endDateOpen} onOpenChange={handleEndDatePopoverChange}>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        type="button"
                        className="h-12 w-full justify-between px-4 text-left font-medium"
                      />
                    }
                  >
                    <span className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-slate-500" />
                      {endDateTime
                        ? format(endDateTime, 'EEE, MMM d, yyyy')
                        : 'Choose an end date'}
                    </span>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="start" className="w-auto space-y-3 p-4">
                    <Calendar
                      mode="single"
                      selected={draftEndDate ?? endDateTime}
                      onSelect={setDraftEndDate}
                      disabled={(date) => isBefore(date, startOfDay(startDateTime))}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEndDateOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSaveEndDate}
                        disabled={!draftEndDate}
                      >
                        Save
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <TimeWheelPopover
                  value={endDateTime}
                  minimumDateTime={startDateTime}
                  inclusive
                  onChange={(nextValue) => handleEndTimeChange(format(nextValue, 'HH:mm'))}
                  disabled={!endDateTime}
                  placeholder="Choose an end time"
                />

                {!endDateTime && (
                  <p className="text-xs text-slate-500">
                    Choose an end date to unlock valid time slots.
                  </p>
                )}

                {errors.endTime && (
                  <p className="text-xs text-red-500">{errors.endTime.message}</p>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm text-slate-500">
                Choose the start date and time first to unlock the end time.
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default BookingForm
