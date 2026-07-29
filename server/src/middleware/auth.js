const jwt = require('jsonwebtoken')
const User = require('../models/User')
const ApiError = require('../utils/ApiError')

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return next(new ApiError(401, 'Authentication required'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return next(new ApiError(401, 'User no longer exists'))
    }

    req.user = user
    next()
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired token'))
  }
}

module.exports = auth
