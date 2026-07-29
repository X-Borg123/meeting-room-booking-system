import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Clock3 } from 'lucide-react'
import {
  WheelPicker,
  WheelPickerWrapper,
} from '@ncdai/react-wheel-picker'
import '@ncdai/react-wheel-picker/style.css'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  getFirstEnabledTimeValueForHour,
  getWheelPickerState,
  mergeDateAndTime,
} from '@/lib/bookingDateTime'

const wheelClassNames = {
  optionItem:
    'text-base text-muted-foreground transition-colors data-[disabled]:opacity-20',
  highlightWrapper:
    'border-y border-border bg-muted/50 text-foreground backdrop-blur-sm',
  highlightItem:
    'text-lg font-semibold text-foreground data-[disabled]:text-muted-foreground',
}

const TimeWheelPopover = ({
  value,
  minimumDateTime = null,
  inclusive = false,
  onChange,
  placeholder,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false)
  const [draftValue, setDraftValue] = useState(null)

  useEffect(() => {
    if (!open) {
      setDraftValue(value ?? null)
    }
  }, [open, value])

  const activeValue = draftValue ?? value

  const pickerState = activeValue
    ? getWheelPickerState(activeValue, {
        selectedDateTime: activeValue,
        minimumDateTime,
        inclusive,
      })
    : null
  const availableHourOptions = pickerState
    ? pickerState.hourOptions.filter((option) => !option.disabled)
    : []
  const availableMinuteOptions = pickerState
    ? pickerState.minuteOptions.filter((option) => !option.disabled)
    : []

  const handleHourChange = (hourValue) => {
    if (!activeValue || !pickerState) {
      return
    }

    const nextTimeValue = getFirstEnabledTimeValueForHour(
      pickerState.timeOptions,
      hourValue,
      pickerState.selectedMinuteValue
    )

    if (!nextTimeValue) {
      return
    }

    setDraftValue(mergeDateAndTime(activeValue, nextTimeValue))
  }

  const handleMinuteChange = (minuteValue) => {
    if (!activeValue || !pickerState) {
      return
    }

    const nextTimeValue = `${pickerState.selectedHourValue}:${minuteValue}`
    const matchedOption = pickerState.timeOptions.find(
      (option) => option.value === nextTimeValue && !option.disabled
    )

    if (!matchedOption) {
      return
    }

    setDraftValue(mergeDateAndTime(activeValue, nextTimeValue))
  }

  const selectedTimeLabel = value ? format(value, 'h:mm a') : placeholder

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen)

    if (nextOpen) {
      setDraftValue(value ?? null)
    }
  }

  const handleCancel = () => {
    setDraftValue(value ?? null)
    setOpen(false)
  }

  const handleSave = () => {
    if (draftValue) {
      onChange(draftValue)
    }

    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            type="button"
            disabled={disabled}
            className="h-12 w-full justify-between px-4 text-left font-medium"
          />
        }
      >
        <span className="flex items-center gap-2">
          <Clock3 size={16} className="text-slate-500" />
          {selectedTimeLabel}
        </span>
      </PopoverTrigger>

      <PopoverContent className="w-[22rem] space-y-3 p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Choose time</p>
          <p className="text-xs text-muted-foreground">
            Only valid hours and minutes are shown.
          </p>
        </div>

        {pickerState && (
          <WheelPickerWrapper className="overflow-hidden rounded-xl border bg-background shadow-xs">
            <div className="relative flex-1 border-r border-border/70">
              <WheelPicker
                options={availableHourOptions}
                value={pickerState.selectedHourValue}
                onValueChange={handleHourChange}
                infinite={false}
                visibleCount={8}
                optionItemHeight={36}
                dragSensitivity={14}
                scrollSensitivity={18}
                classNames={wheelClassNames}
              />
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-muted-foreground">
                hour
              </div>
            </div>

            <div className="relative flex-1">
              <WheelPicker
                options={availableMinuteOptions}
                value={pickerState.selectedMinuteValue}
                onValueChange={handleMinuteChange}
                infinite={false}
                visibleCount={8}
                optionItemHeight={36}
                dragSensitivity={14}
                scrollSensitivity={18}
                classNames={wheelClassNames}
              />
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-muted-foreground">
                min
              </div>
            </div>
          </WheelPickerWrapper>
        )}

        {activeValue && pickerState && (
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-foreground">
            Selected time:{' '}
            <span className="font-medium">
              {format(
                mergeDateAndTime(
                  activeValue,
                  `${pickerState.selectedHourValue}:${pickerState.selectedMinuteValue}`
                ),
                'h:mm a'
              )}
            </span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!draftValue}>
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default TimeWheelPopover
