const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc')
const errorHandler = require('./middleware/errorHandler')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const bookingRoutes = require('./routes/bookingRoutes')

const app = express()

// Security
app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
})
app.use('/api/', limiter)

// Body parsing
app.use(express.json())

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// Swagger API documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Meeting Room Booking API',
      version: '1.0.0',
      description:
        'REST API for managing meeting room bookings with role-based access control',
    },
    servers: [
      { url: process.env.API_URL || 'http://localhost:5000' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
}

const specs = swaggerJsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/bookings', bookingRoutes)

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Meeting Room Booking API',
    docs: '/api-docs',
  })
})

// Error handler (must be last)
app.use(errorHandler)

module.exports = app
