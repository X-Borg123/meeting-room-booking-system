const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const ApiError = require('../utils/ApiError')
const catchAsync = require('../utils/catchAsync')

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    throw new ApiError(401, 'Invalid credentials')
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
})

const getMe = catchAsync(async (req, res) => {
  res.json({ success: true, user: req.user })
})

module.exports = { login, getMe }
