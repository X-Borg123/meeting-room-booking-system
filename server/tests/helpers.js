const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../src/models/User')
const Booking = require('../src/models/Booking')

const createTestUser = async (overrides = {}) => {
  const defaults = {
    name: 'Test User',
    email: 'test@test.com',
    password: await bcrypt.hash('password123', 10),
    role: 'user',
  }
  return User.create({ ...defaults, ...overrides })
}

const getAuthToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'testsecret', {
    expiresIn: '7d',
  })
}

const createTestBooking = async (userId, overrides = {}) => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  const tomorrowEnd = new Date(tomorrow)
  tomorrowEnd.setHours(11, 0, 0, 0)

  const defaults = {
    title: 'Test Meeting',
    userId,
    startTime: tomorrow,
    endTime: tomorrowEnd,
  }
  return Booking.create({ ...defaults, ...overrides })
}

module.exports = { createTestUser, getAuthToken, createTestBooking }
