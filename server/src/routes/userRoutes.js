const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const checkRole = require('../middleware/checkRole')
const validate = require('../middleware/validate')
const {
  createUserRules,
  updateRoleRules,
} = require('../validators/userValidators')
const {
  getUsers,
  getUserStats,
  createUser,
  updateUserRole,
  deleteUser,
} = require('../controllers/userController')

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Access denied
 */
router.get('/', auth, checkRole('admin'), getUsers)
router.get('/stats', auth, checkRole('admin'), getUserStats)

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, owner, user]
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error or duplicate email
 */
router.post('/', auth, checkRole('admin'), createUserRules, validate, createUser)

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Update a user's role (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, owner, user]
 *     responses:
 *       200:
 *         description: Role updated
 *       400:
 *         description: Cannot change own role
 */
router.patch(
  '/:id/role',
  auth,
  checkRole('admin'),
  updateRoleRules,
  validate,
  updateUserRole
)

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user and their bookings (admin only)
 *     tags: [Users]
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
 *         description: User deleted
 *       400:
 *         description: Cannot delete self
 *       404:
 *         description: User not found
 */
router.delete('/:id', auth, checkRole('admin'), deleteUser)

module.exports = router
