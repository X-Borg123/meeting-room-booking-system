require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('./src/models/User')
const Booking = require('./src/models/Booking')

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    await User.deleteMany()
    await Booking.deleteMany()
    console.log('Cleared existing data')

    const testPassword = 'Password#123'
    const hashedPassword = await bcrypt.hash(testPassword, 10)

    await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@test.com',
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
        name: 'Regular User',
        email: 'user@test.com',
        password: hashedPassword,
        role: 'user',
      },
    ])

    console.log('Database seeded successfully')
    console.log('')
    console.log(`Test Accounts (password: ${testPassword}):`)
    console.log('  Admin  -> admin@test.com')
    console.log('  Owner  -> owner@test.com')
    console.log('  User   -> user@test.com')

    await mongoose.disconnect()
  } catch (err) {
    console.error('Seed error:', err.message)
    process.exit(1)
  }
}

seed()
