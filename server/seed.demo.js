require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('./src/models/User')
const Booking = require('./src/models/Booking')

const DEMO_PASSWORD = 'Password#123'
const BASE_DATE_TIME = new Date('2026-07-29T15:26:00+06:30')
const USER_COUNT = 10
const BOOKING_COUNT = 20

const FIRST_NAMES = [
  'Aung',
  'Kyaw',
  'Zaw',
  'Min',
  'Htet',
  'Thura',
  'Nay',
  'Pyae',
  'Ye',
  'Ko',
]

const LAST_NAMES = [
  'Naing',
  'Oo',
  'Win',
  'Myo',
  'Linn',
  'Htun',
  'Soe',
  'Tun',
  'Phyo',
  'Zin',
]

const BOOKING_TOPICS = [
  'Sprint Planning',
  'Code Review Session',
  'Bug Triage Meeting',
  'System Architecture Discussion',
  'API Integration Sync',
  'Database Design Review',
  'CI/CD Pipeline Setup',
  'Feature Requirement Gathering',
  'Tech Stack Decision',
  'Project Kickoff Meeting',
]

const buildUsers = async () => {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10)
  const users = [
    {
      name: 'Admin User',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
    },
    {
      name: 'Admin Manager',
      email: 'admin2@test.com',
      password: hashedPassword,
      role: 'admin',
    },
    {
      name: 'Owner User',
      email: 'owner@test.com',
      password: hashedPassword,
      role: 'owner',
    },
    {
      name: 'Owner Manager',
      email: 'owner2@test.com',
      password: hashedPassword,
      role: 'owner',
    },
    {
      name: 'Regular User',
      email: 'user@test.com',
      password: hashedPassword,
      role: 'user',
    },
  ]

  for (let index = users.length; index < USER_COUNT; index += 1) {
    const firstName = FIRST_NAMES[index % FIRST_NAMES.length]
    const lastName = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length]
    const sequence = String(index + 1).padStart(2, '0')

    users.push({
      name: `${firstName} ${lastName} ${sequence}`,
      email: `demo${sequence}@test.com`,
      password: hashedPassword,
      role: 'user',
    })
  }

  return users
}

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60 * 1000)

const MINUTE_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

const setTimeParts = (date, hours, minutes) => {
  const nextDate = new Date(date)
  nextDate.setHours(hours, minutes, 0, 0)
  return nextDate
}

const moveToNextValidSlot = (date) => {
  const nextDate = new Date(date)
  nextDate.setSeconds(0, 0)

  if (nextDate.getHours() < 8) {
    return setTimeParts(nextDate, 8, 5)
  }

  if (nextDate.getHours() > 20 || (nextDate.getHours() === 20 && nextDate.getMinutes() > 25)) {
    const followingDay = addMinutes(setTimeParts(nextDate, 8, 5), 24 * 60)
    return followingDay
  }

  const currentMinutes = nextDate.getMinutes()
  const nextValidMinute = MINUTE_OPTIONS.find((minute) => minute >= currentMinutes)

  if (typeof nextValidMinute === 'number') {
    nextDate.setMinutes(nextValidMinute, 0, 0)
    return nextDate
  }

  return addMinutes(setTimeParts(nextDate, nextDate.getHours() + 1, 5), 0)
}

const ensureWorkingHours = (startTime, durationMinutes) => {
  let candidate = moveToNextValidSlot(startTime)
  let endTime = addMinutes(candidate, durationMinutes)

  while (endTime.getHours() > 22 || (endTime.getHours() === 22 && endTime.getMinutes() > 0)) {
    candidate = addMinutes(setTimeParts(candidate, 8, 5), 24 * 60)
    candidate = moveToNextValidSlot(candidate)
    endTime = addMinutes(candidate, durationMinutes)
  }

  return {
    startTime: candidate,
    endTime,
  }
}

const buildBookings = (users) => {
  const bookings = []
  const bookingUsers = users.filter((user) => user.role !== 'admin')
  const scheduleBlocks = [
    {
      start: new Date('2026-07-28T08:05:00+06:30'),
      durations: [30, 60, 90, 120, 150],
    },
    {
      start: new Date('2026-07-29T08:05:00+06:30'),
      durations: [30, 60, 90, 120],
    },
    {
      start: new Date('2026-07-29T15:25:00+06:30'),
      durations: [60],
    },
    {
      start: new Date('2026-07-29T16:30:00+06:30'),
      durations: [30, 60, 90, 60],
    },
    {
      start: new Date('2026-07-30T08:05:00+06:30'),
      durations: [30, 60, 90, 120, 150, 30],
    },
  ]
  let anchorIndex = 0
  let bookingsInCurrentBlock = 0
  let nextStartTime = scheduleBlocks[0].start

  for (let index = 0; index < BOOKING_COUNT; index += 1) {
    if (bookingsInCurrentBlock === scheduleBlocks[anchorIndex].durations.length) {
      anchorIndex += 1
      bookingsInCurrentBlock = 0
      nextStartTime = scheduleBlocks[anchorIndex].start
    }

    const user = bookingUsers[index % bookingUsers.length]
    const topic = BOOKING_TOPICS[index % BOOKING_TOPICS.length]
    const durationMinutes = scheduleBlocks[anchorIndex].durations[bookingsInCurrentBlock]
    const { startTime, endTime } = ensureWorkingHours(nextStartTime, durationMinutes)

    bookings.push({
      userId: user._id,
      title: `${topic} ${String(index + 1).padStart(2, '0')}`,
      startTime,
      endTime,
      createdAt: addMinutes(BASE_DATE_TIME, -index),
      updatedAt: addMinutes(BASE_DATE_TIME, -index),
    })

    nextStartTime = addMinutes(endTime, 5)
    bookingsInCurrentBlock += 1
  }

  return bookings
}

const seedDemo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    await Booking.deleteMany({})
    await User.deleteMany({})
    console.log('Cleared existing data')

    const userPayload = await buildUsers()
    const users = await User.insertMany(userPayload)
    const bookings = buildBookings(users)
    await Booking.insertMany(bookings)

    console.log('Demo database seeded successfully')
    console.log('')
    console.log(`Reference date/time: ${BASE_DATE_TIME.toISOString()} (base for seeded bookings)`)
    console.log(`Users created: ${users.length}`)
    console.log(`Bookings created: ${bookings.length}`)
    console.log('')
    console.log(`Login password for all users: ${DEMO_PASSWORD}`)
    console.log('Main accounts:')
    console.log('  Admin  -> admin@test.com')
    console.log('  Admin  -> admin2@test.com')
    console.log('  Owner  -> owner@test.com')
    console.log('  Owner  -> owner2@test.com')
    console.log('  User   -> user@test.com')

    await mongoose.disconnect()
  } catch (error) {
    console.error('Demo seed error:', error.message)
    process.exit(1)
  }
}

seedDemo()
