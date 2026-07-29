import { z } from 'zod'

export const PASSWORD_POLICY_MESSAGE =
  'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'

export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/

const bookingDateField = (label) =>
  z.preprocess((value) => {
    if (value instanceof Date) {
      return value
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const parsedDate = new Date(value)

      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate
      }
    }

    return value
  }, z.date({ required_error: `${label} is required` }))

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const bookingSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
    startTime: bookingDateField('Start time'),
    endTime: bookingDateField('End time'),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'Start time must be before end time',
    path: ['endTime'],
  })

export const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .regex(STRONG_PASSWORD_REGEX, PASSWORD_POLICY_MESSAGE),
  role: z.enum(['admin', 'owner', 'user'], { required_error: 'Role is required' }),
})
