import { addMinutes, format, isBefore, isSameDay, set } from 'date-fns'

export const TIME_SLOT_INTERVAL_MINUTES = 5
export const DEFAULT_START_TIME_VALUE = '09:00'
export const DEFAULT_END_DURATION_MINUTES = 60
export const HOUR_VALUES = [
  ...Array.from({ length: 23 }, (_, index) =>
    String(index + 1).padStart(2, '0')
  ),
  '00',
]
export const MINUTE_VALUES = Array.from(
  { length: 60 / TIME_SLOT_INTERVAL_MINUTES },
  (_, index) => String(index * TIME_SLOT_INTERVAL_MINUTES).padStart(2, '0')
)

export const TIME_SLOT_VALUES = Array.from(
  { length: (24 * 60) / TIME_SLOT_INTERVAL_MINUTES },
  (_, index) => {
    const totalMinutes = index * TIME_SLOT_INTERVAL_MINUTES
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
    const minutes = String(totalMinutes % 60).padStart(2, '0')
    return `${hours}:${minutes}`
  }
)

export const roundUpToInterval = (
  date,
  interval = TIME_SLOT_INTERVAL_MINUTES
) => {
  const intervalMs = interval * 60 * 1000
  return new Date(Math.ceil(date.getTime() / intervalMs) * intervalMs)
}

export const mergeDateAndTime = (date, timeValue) => {
  const [hours, minutes] = timeValue.split(':').map(Number)

  return set(new Date(date), {
    hours,
    minutes,
    seconds: 0,
    milliseconds: 0,
  })
}

export const getTimeValue = (date) => format(date, 'HH:mm')

export const splitTimeValue = (timeValue) => {
  const [hours = '00', minutes = '00'] = timeValue.split(':')

  return { hours, minutes }
}

export const formatTimeOptionLabel = (timeValue) => {
  const preview = mergeDateAndTime(new Date(), timeValue)
  return format(preview, 'h:mm a')
}

export const getFirstEnabledTimeValue = (timeOptions) =>
  timeOptions.find((option) => !option.disabled)?.value ?? null

export const getFirstEnabledTimeValueForHour = (
  timeOptions,
  hourValue,
  preferredMinuteValue = null
) => {
  const enabledHourOptions = timeOptions.filter(
    (option) => option.value.startsWith(`${hourValue}:`) && !option.disabled
  )

  if (!enabledHourOptions.length) {
    return null
  }

  if (preferredMinuteValue) {
    const preferredOption = enabledHourOptions.find(
      (option) => option.value === `${hourValue}:${preferredMinuteValue}`
    )

    if (preferredOption) {
      return preferredOption.value
    }
  }

  return enabledHourOptions[0].value
}

export const getWheelPickerState = (
  selectedDate,
  { selectedDateTime = null, minimumDateTime = null, inclusive = false } = {}
) => {
  const timeOptions = getTimeOptionsForDate(selectedDate, {
    minimumDateTime,
    inclusive,
  })
  const currentTimeValue = selectedDateTime ? getTimeValue(selectedDateTime) : null
  const currentOption = currentTimeValue
    ? timeOptions.find(
        (option) => option.value === currentTimeValue && !option.disabled
      )
    : null
  const fallbackTimeValue =
    currentOption?.value ?? getFirstEnabledTimeValue(timeOptions)
  const { hours: selectedHourValue = HOUR_VALUES[0], minutes: selectedMinuteValue = MINUTE_VALUES[0] } =
    fallbackTimeValue ? splitTimeValue(fallbackTimeValue) : {}

  const hourOptions = HOUR_VALUES.map((hourValue) => {
    const hasEnabledOption = timeOptions.some(
      (option) => option.value.startsWith(`${hourValue}:`) && !option.disabled
    )

    return {
      value: hourValue,
      label: hourValue === '00' ? '24' : String(Number(hourValue)),
      disabled: !hasEnabledOption,
    }
  })

  const minuteOptions = MINUTE_VALUES.map((minuteValue) => {
    const matchedOption = timeOptions.find(
      (option) => option.value === `${selectedHourValue}:${minuteValue}`
    )

    return {
      value: minuteValue,
      label: String(Number(minuteValue)),
      disabled: matchedOption ? matchedOption.disabled : true,
    }
  })

  return {
    hourOptions,
    minuteOptions,
    selectedHourValue,
    selectedMinuteValue,
    timeOptions,
  }
}

export const getSuggestedDateTime = ({
  day,
  currentDateTime = null,
  minimumDateTime = null,
  fallbackTimeValue = DEFAULT_START_TIME_VALUE,
}) => {
  const baseTimeValue = currentDateTime
    ? getTimeValue(currentDateTime)
    : fallbackTimeValue

  let nextDateTime = mergeDateAndTime(day, baseTimeValue)

  if (
    minimumDateTime &&
    isSameDay(nextDateTime, minimumDateTime) &&
    isBefore(nextDateTime, minimumDateTime)
  ) {
    nextDateTime = minimumDateTime
  }

  return nextDateTime
}

export const getTimeOptionsForDate = (
  selectedDate,
  { minimumDateTime = null, inclusive = false } = {}
) =>
  TIME_SLOT_VALUES.map((value) => {
    const dateTime = mergeDateAndTime(selectedDate, value)
    const disabled =
      minimumDateTime && isSameDay(dateTime, minimumDateTime)
        ? inclusive
          ? dateTime <= minimumDateTime
          : dateTime < minimumDateTime
        : false

    return {
      value,
      label: formatTimeOptionLabel(value),
      disabled,
    }
  })

export const getDefaultEndDateTime = (startDateTime) =>
  addMinutes(startDateTime, DEFAULT_END_DURATION_MINUTES)
