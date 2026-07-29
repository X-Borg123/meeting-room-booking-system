const bcrypt = require('bcrypt')
const User = require('../models/User')
const Booking = require('../models/Booking')
const ApiError = require('../utils/ApiError')
const catchAsync = require('../utils/catchAsync')

const parseListOptions = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
  const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1)
  const search = req.query.search?.trim() || ''

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    search,
  }
}

const getUsers = catchAsync(async (req, res) => {
  const { page, limit, skip, search } = parseListOptions(req)
  const query = search
    ? {
        $or: [
          { name: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
          { role: new RegExp(search, 'i') },
        ],
      }
    : {}

  const totalItems = await User.countDocuments(query)
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  res.json({
    success: true,
    data: users,
    meta: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    },
  })
})

const getUserStats = catchAsync(async (req, res) => {
  const [total, admins, owners] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'owner' }),
  ])

  res.json({
    success: true,
    data: { total, admins, owners },
  })
})

const createUser = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body
  const normalizedEmail = email.trim().toLowerCase()

  const existing = await User.findOne({ email: normalizedEmail })
  if (existing) {
    throw new ApiError(400, 'A user with this email already exists')
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashed,
    role,
  })

  const { password: _, ...userWithoutPassword } = user.toObject()
  res.status(201).json({ success: true, data: userWithoutPassword })
})

const updateUserRole = catchAsync(async (req, res) => {
  const { role } = req.body

  if (req.params.id === req.user.id.toString()) {
    throw new ApiError(400, 'Cannot change your own role')
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { returnDocument: 'after' }
  ).select('-password')

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  res.json({ success: true, data: user })
})

const deleteUser = catchAsync(async (req, res) => {
  if (req.params.id === req.user.id.toString()) {
    throw new ApiError(400, 'Cannot delete your own account')
  }

  const user = await User.findById(req.params.id)
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  await Booking.deleteMany({ userId: req.params.id })
  await user.deleteOne()

  res.json({
    success: true,
    message: 'User and their bookings deleted successfully',
  })
})

module.exports = { getUsers, getUserStats, createUser, updateUserRole, deleteUser }
