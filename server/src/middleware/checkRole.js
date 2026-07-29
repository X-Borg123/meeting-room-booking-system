const ApiError = require('../utils/ApiError')

const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Access denied. Required role: ${roles.join(' or ')}`)
      )
    }
    next()
  }
}

module.exports = checkRole
