const request = require('supertest')
const app = require('../src/app')
const Booking = require('../src/models/Booking')
const { createTestUser, getAuthToken, createTestBooking } = require('./helpers')

require('./setup')

process.env.JWT_SECRET = 'testsecret'

describe('User Endpoints', () => {
  let admin, adminToken, userToken

  beforeEach(async () => {
    admin = await createTestUser({ email: 'admin@test.com', role: 'admin' })
    const regularUser = await createTestUser({ email: 'user@test.com', role: 'user' })
    adminToken = getAuthToken(admin)
    userToken = getAuthToken(regularUser)
  })

  describe('GET /api/users', () => {
    it('should allow admin to list users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data.length).toBeGreaterThan(0)
    })

    it('should deny non-admin access', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)

      expect(res.status).toBe(403)
    })
  })

  describe('POST /api/users', () => {
    it('should allow admin to create user', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New User',
          email: 'new@test.com',
          password: 'Password123!',
          role: 'user',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.email).toBe('new@test.com')
      expect(res.body.data.password).toBeUndefined()
    })

    it('should return 400 for duplicate email', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Dup',
          email: 'admin@test.com',
          password: 'Password123!',
          role: 'user',
        })

      expect(res.status).toBe(400)
    })

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'No Email' })

      expect(res.status).toBe(400)
    })

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Bad Email',
          email: 'bad-email',
          password: 'Password123!',
          role: 'user',
        })

      expect(res.status).toBe(400)
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: 'Enter a valid email address',
          }),
        ])
      )
    })

    it('should return 400 for weak passwords', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Weak Password',
          email: 'weak@test.com',
          password: 'password123',
          role: 'user',
        })

      expect(res.status).toBe(400)
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message:
              'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
          }),
        ])
      )
    })
  })

  describe('PATCH /api/users/:id/role', () => {
    it('should allow admin to update role', async () => {
      const target = await createTestUser({ email: 'target@test.com', role: 'user' })

      const res = await request(app)
        .patch(`/api/users/${target._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'owner' })

      expect(res.status).toBe(200)
      expect(res.body.data.role).toBe('owner')
    })

    it('should not allow admin to change own role', async () => {
      const res = await request(app)
        .patch(`/api/users/${admin._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'user' })

      expect(res.status).toBe(400)
    })

    it('should return 400 for invalid role', async () => {
      const target = await createTestUser({ email: 'target2@test.com' })

      const res = await request(app)
        .patch(`/api/users/${target._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'superadmin' })

      expect(res.status).toBe(400)
    })
  })

  describe('DELETE /api/users/:id', () => {
    it('should delete user and their bookings', async () => {
      const target = await createTestUser({ email: 'del@test.com' })
      await createTestBooking(target._id)

      const res = await request(app)
        .delete(`/api/users/${target._id}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)

      const bookings = await Booking.find({ userId: target._id })
      expect(bookings).toHaveLength(0)
    })

    it('should not allow admin to delete self', async () => {
      const res = await request(app)
        .delete(`/api/users/${admin._id}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(400)
    })

    it('should deny non-admin access', async () => {
      const target = await createTestUser({ email: 'nodelete@test.com' })

      const res = await request(app)
        .delete(`/api/users/${target._id}`)
        .set('Authorization', `Bearer ${userToken}`)

      expect(res.status).toBe(403)
    })
  })
})
