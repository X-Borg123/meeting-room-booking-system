const Booking = require('../models/Booking')
const User = require('../models/User')
const ApiError = require('../utils/ApiError')
const catchAsync = require('../utils/catchAsync')

const parseListOptions = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
  const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1)
  const search = req.query.search?.trim() || ''
  const role = req.query.role?.trim() || ''

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    search,
    role,
  }
}

const buildPaginationMeta = (page, limit, totalItems) => ({
  page,
  limit,
  totalItems,
  totalPages: Math.max(1, Math.ceil(totalItems / limit)),
})

/**
 * Overlap detection:
 * Two intervals overlap when: startA < endB AND endA > startB
 * Back-to-back bookings (endA === startB) are ALLOWED.
 */
const hasOverlap = async (startTime, endTime, excludeId = null) => {
  const query = {
    startTime: { $lt: new Date(endTime) },
    endTime: { $gt: new Date(startTime) },
  }

  if (excludeId) {
    query._id = { $ne: excludeId }
  }

  return Booking.findOne(query)
}

const getBookings = catchAsync(async (req, res) => {
  const { page, limit, skip, search, role } = parseListOptions(req)
  const query = {}
  let matchedUserIds = null

  if (role && ['admin', 'owner', 'user'].includes(role)) {
    matchedUserIds = await User.find({ role }).distinct('_id')
    query.userId = { $in: matchedUserIds }
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i')
    const userQuery = {
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { role: searchRegex },
      ],
    }

    if (matchedUserIds) {
      userQuery._id = { $in: matchedUserIds }
    }

    const matchedUsers = await User.find(userQuery).select('_id')

    query.$or = [
      { title: searchRegex },
      { userId: { $in: matchedUsers.map((user) => user._id) } },
    ]
  }

  const totalItems = await Booking.countDocuments(query)
  const bookings = await Booking.find(query)
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  res.json({
    success: true,
    data: bookings,
    meta: buildPaginationMeta(page, limit, totalItems),
  })
})

const getBookingsByUser = catchAsync(async (req, res) => {
  const { page, limit, skip, search, role } = parseListOptions(req)
  const pipeline = [
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
  ]

  if (role && ['admin', 'owner', 'user'].includes(role)) {
    pipeline.push({
      $match: {
        'user.role': role,
      },
    })
  }

  pipeline.push(
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$user._id',
        user: {
          $first: {
            _id: '$user._id',
            name: '$user.name',
            email: '$user.email',
            role: '$user.role',
          },
        },
        latestCreatedAt: { $max: '$createdAt' },
        bookings: {
          $push: {
            _id: '$_id',
            title: '$title',
            startTime: '$startTime',
            endTime: '$endTime',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
          },
        },
      },
    }
  )

  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { 'user.name': { $regex: search, $options: 'i' } },
          { 'user.email': { $regex: search, $options: 'i' } },
          { 'user.role': { $regex: search, $options: 'i' } },
          { 'bookings.title': { $regex: search, $options: 'i' } },
        ],
      },
    })
  }

  pipeline.push({ $sort: { latestCreatedAt: -1 } })

  const [result] = await Booking.aggregate([
    ...pipeline,
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          { $project: { latestCreatedAt: 0 } },
        ],
        meta: [{ $count: 'totalItems' }],
      },
    },
  ])

  const paginatedGroups = result?.data ?? []
  const totalItems = result?.meta?.[0]?.totalItems ?? 0

  res.json({
    success: true,
    data: paginatedGroups,
    meta: buildPaginationMeta(page, limit, totalItems),
  })
})

const getSummary = catchAsync(async (req, res) => {
  const { page, limit, skip, search, role } = parseListOptions(req)
  const pipeline = [
    {
      $group: {
        _id: '$userId',
        totalBookings: { $sum: 1 },
        latestCreatedAt: { $max: '$createdAt' },
        totalHours: {
          $sum: {
            $divide: [{ $subtract: ['$endTime', '$startTime'] }, 3600000],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
  ]

  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { 'user.name': { $regex: search, $options: 'i' } },
          { 'user.email': { $regex: search, $options: 'i' } },
          { 'user.role': { $regex: search, $options: 'i' } },
        ],
      },
    })
  }

  if (role && ['admin', 'owner', 'user'].includes(role)) {
    pipeline.push({
      $match: {
        'user.role': role,
      },
    })
  }

  pipeline.push(
    { $project: { 'user.password': 0 } },
    { $sort: { latestCreatedAt: -1 } }
  )

  const totalItems =
    (await Booking.aggregate([...pipeline, { $count: 'count' }]))[0]?.count ?? 0

  const summary = await Booking.aggregate([
    ...pipeline,
    { $skip: skip },
    { $limit: limit },
  ])

  res.json({
    success: true,
    data: summary,
    meta: buildPaginationMeta(page, limit, totalItems),
  })
})

const getDashboardStats = catchAsync(async (req, res) => {
  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const endOfToday = new Date(now)
  endOfToday.setHours(23, 59, 59, 999)

  const [total, today, upcoming, mine] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({
      startTime: { $gte: startOfToday, $lte: endOfToday },
    }),
    Booking.countDocuments({ startTime: { $gt: now } }),
    Booking.countDocuments({ userId: req.user.id }),
  ])

  res.json({
    success: true,
    data: { total, today, upcoming, mine },
  })
})

const createBooking = catchAsync(async (req, res) => {
  const { title, startTime, endTime } = req.body

  const start = new Date(startTime)
  const end = new Date(endTime)

  if (start >= end) {
    throw new ApiError(400, 'Start time must be before end time')
  }

  if (start < new Date()) {
    throw new ApiError(400, 'Cannot create a booking in the past')
  }

  const overlap = await hasOverlap(startTime, endTime)
  if (overlap) {
    throw new ApiError(409, 'This time slot overlaps with an existing booking')
  }

  const booking = await Booking.create({
    title,
    userId: req.user.id,
    startTime: start,
    endTime: end,
  })

  await booking.populate('userId', 'name email role')

  res.status(201).json({ success: true, data: booking })
})

const deleteBooking = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id)

  if (!booking) {
    throw new ApiError(404, 'Booking not found')
  }

  const isCreator = booking.userId.toString() === req.user.id.toString()
  const isPrivileged = ['admin', 'owner'].includes(req.user.role)

  if (!isCreator && !isPrivileged) {
    throw new ApiError(403, 'You can only delete your own bookings')
  }

  await booking.deleteOne()

  res.json({ success: true, message: 'Booking deleted successfully' })
})

module.exports = {
  getBookings,
  getBookingsByUser,
  getSummary,
  getDashboardStats,
  createBooking,
  deleteBooking,
}
