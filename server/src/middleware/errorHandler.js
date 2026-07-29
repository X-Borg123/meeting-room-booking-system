const { StatusCodes } = require('http-status-codes')

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
  const message = err.isOperational ? err.message : 'Something went wrong'

  if (!err.isOperational) {
    console.error('UNEXPECTED ERROR:', err)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

module.exports = errorHandler
