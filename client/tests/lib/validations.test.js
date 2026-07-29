import { describe, expect, it } from 'vitest'
import { addHours } from 'date-fns'

import {
  bookingSchema,
  createUserSchema,
  PASSWORD_POLICY_MESSAGE,
} from '@/lib/validations'
import {
  getSuggestedDateTime,
  getTimeOptionsForDate,
  mergeDateAndTime,
  roundUpToInterval,
} from '@/lib/bookingDateTime'

describe('createUserSchema', () => {
  it('rejects malformed email addresses', () => {
    const result = createUserSchema.safeParse({
      name: 'Admin User',
      email: 'not-an-email',
      password: 'Password123!',
      role: 'user',
    })

    expect(result.success).toBe(false)
    expect(result.error.flatten().fieldErrors.email).toContain(
      'Enter a valid email address'
    )
  })

  it('requires a stronger password', () => {
    const result = createUserSchema.safeParse({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'user',
    })

    expect(result.success).toBe(false)
    expect(result.error.flatten().fieldErrors.password).toContain(
      PASSWORD_POLICY_MESSAGE
    )
  })

  it('accepts trimmed email with a strong password', () => {
    const result = createUserSchema.safeParse({
      name: 'Admin User',
      email: '  admin@example.com ',
      password: 'Password123!',
      role: 'admin',
    })

    expect(result.success).toBe(true)
    expect(result.data.email).toBe('admin@example.com')
  })
})

describe('bookingSchema', () => {
  it('accepts Date objects from the custom picker', () => {
    const startTime = new Date('2026-07-29T09:00:00')
    const endTime = addHours(startTime, 1)

    const result = bookingSchema.safeParse({
      title: 'Planning',
      startTime,
      endTime,
    })

    expect(result.success).toBe(true)
  })

  it('rejects an end time before the start time', () => {
    const startTime = new Date('2026-07-29T11:00:00')
    const endTime = new Date('2026-07-29T10:45:00')

    const result = bookingSchema.safeParse({
      title: 'Planning',
      startTime,
      endTime,
    })

    expect(result.success).toBe(false)
    expect(result.error.flatten().fieldErrors.endTime).toContain(
      'Start time must be before end time'
    )
  })
})

describe('bookingDateTime helpers', () => {
  it('rounds the minimum start time up to the next slot', () => {
    const now = new Date('2026-07-28T16:07:00')

    expect(roundUpToInterval(now).toISOString()).toBe(
      new Date('2026-07-28T16:10:00').toISOString()
    )
  })

  it('disables past time slots on the current day', () => {
    const minimumDateTime = new Date('2026-07-28T16:15:00')
    const selectedDate = new Date('2026-07-28T00:00:00')
    const options = getTimeOptionsForDate(selectedDate, { minimumDateTime })

    expect(options.find((option) => option.value === '16:00')?.disabled).toBe(true)
    expect(options.find((option) => option.value === '16:15')?.disabled).toBe(
      false
    )
  })

  it('clamps a same-day selection to the next allowed slot', () => {
    const minimumDateTime = new Date('2026-07-28T16:15:00')
    const nextStart = getSuggestedDateTime({
      day: new Date('2026-07-28T00:00:00'),
      currentDateTime: mergeDateAndTime(new Date('2026-07-28T00:00:00'), '09:00'),
      minimumDateTime,
    })

    expect(nextStart.toISOString()).toBe(minimumDateTime.toISOString())
  })
})
