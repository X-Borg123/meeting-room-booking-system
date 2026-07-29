const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const checkRole = require('../middleware/checkRole')
const validate = require('../middleware/validate')
const { createBookingRules } = require('../validators/bookingValidators')
const {
  getBookings,
  getBookingsByUser,
  getSummary,
  getDashboardStats,
  createBooking,
  deleteBooking,
} = require('../controllers/bookingController')

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bookings
 */
router.get('/', auth, getBookings)

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, startTime, endTime]
 *             properties:
 *               title:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Booking created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Time slot overlap
 */
router.post(
  '/',
  auth,
  checkRole('owner', 'user'),
  createBookingRules,
  validate,
  createBooking
)

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Delete a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Booking not found
 */
router.delete('/:id', auth, deleteBooking)

/**
 * @swagger
 * /api/bookings/grouped:
 *   get:
 *     summary: Get bookings grouped by user (owner only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookings grouped by user
 *       403:
 *         description: Access denied
 */
router.get('/grouped', auth, checkRole('owner'), getBookingsByUser)
router.get('/stats', auth, getDashboardStats)

/**
 * @swagger
 * /api/bookings/summary:
 *   get:
 *     summary: Get booking usage summary (owner only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usage summary per user
 *       403:
 *         description: Access denied
 */
router.get('/summary', auth, checkRole('owner'), getSummary)

module.exports = router
