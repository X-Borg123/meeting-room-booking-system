const request = require('supertest')
const app = require('../src/app')
const { createTestUser, getAuthToken, createTestBooking } = require('./helpers')

require('./setup')

process.env.JWT_SECRET = 'testsecret'

describe('Booking Endpoints', () => {
  let user, admin, owner, userToken, adminToken, ownerToken

  beforeEach(async () => {
    user = await createTestUser({ email: 'user@test.com', role: 'user' })
    admin = await createTestUser({ email: 'admin@test.com', role: 'admin' })
    owner = await createTestUser({ email: 'owner@test.com', role: 'owner' })
    userToken = getAuthToken(user)
    adminToken = getAuthToken(admin)
    ownerToken = getAuthToken(owner)
  })

  describe('GET /api/bookings', () => {
    it('should return all bookings when authenticated', async () => {
      await createTestBooking(user._id)

      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
    })

    it('should return 401 without auth', async () => {
      const res = await request(app).get('/api/bookings')
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/bookings', () => {
    it('should create booking with valid data', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(14, 0, 0, 0)

      const end = new Date(tomorrow)
      end.setHours(15, 0, 0, 0)

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Team Standup',
          startTime: tomorrow.toISOString(),
          endTime: end.toISOString(),
        })

      expect(res.status).toBe(201)
      expect(res.body.data.title).toBe('Team Standup')
    })

    it('should not allow admin to create bookings', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(14, 0, 0, 0)

      const end = new Date(tomorrow)
      end.setHours(15, 0, 0, 0)

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Meeting',
          startTime: tomorrow.toISOString(),
          endTime: end.toISOString(),
        })

      expect(res.status).toBe(403)
    })

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: '' })

      expect(res.status).toBe(400)
    })

    it('should return 400 when startTime >= endTime', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(14, 0, 0, 0)

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Bad Meeting',
          startTime: tomorrow.toISOString(),
          endTime: tomorrow.toISOString(),
        })

      expect(res.status).toBe(400)
    })

    it('should return 400 for booking in the past', async () => {
      const past = new Date('2020-01-01T10:00:00Z')
      const pastEnd = new Date('2020-01-01T11:00:00Z')

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Past Meeting',
          startTime: past.toISOString(),
          endTime: pastEnd.toISOString(),
        })

      expect(res.status).toBe(400)
    })

    it('should return 409 for overlapping booking', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)

      const end = new Date(tomorrow)
      end.setHours(11, 0, 0, 0)

      await createTestBooking(user._id, { startTime: tomorrow, endTime: end })

      const overlapStart = new Date(tomorrow)
      overlapStart.setHours(10, 30, 0, 0)
      const overlapEnd = new Date(tomorrow)
      overlapEnd.setHours(11, 30, 0, 0)

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Overlap Meeting',
          startTime: overlapStart.toISOString(),
          endTime: overlapEnd.toISOString(),
        })

      expect(res.status).toBe(409)
    })

    it('should allow back-to-back bookings', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)

      const mid = new Date(tomorrow)
      mid.setHours(11, 0, 0, 0)

      const end = new Date(tomorrow)
      end.setHours(12, 0, 0, 0)

      await createTestBooking(user._id, { startTime: tomorrow, endTime: mid })

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Back to Back',
          startTime: mid.toISOString(),
          endTime: end.toISOString(),
        })

      expect(res.status).toBe(201)
    })
  })

  describe('DELETE /api/bookings/:id', () => {
    it('should allow user to delete their own booking', async () => {
      const booking = await createTestBooking(user._id)

      const res = await request(app)
        .delete(`/api/bookings/${booking._id}`)
        .set('Authorization', `Bearer ${userToken}`)

      expect(res.status).toBe(200)
    })

    it('should not allow user to delete others booking', async () => {
      const booking = await createTestBooking(admin._id)

      const res = await request(app)
        .delete(`/api/bookings/${booking._id}`)
        .set('Authorization', `Bearer ${userToken}`)

      expect(res.status).toBe(403)
    })

    it('should allow admin to delete any booking', async () => {
      const booking = await createTestBooking(user._id)

      const res = await request(app)
        .delete(`/api/bookings/${booking._id}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
    })

    it('should allow owner to delete any booking', async () => {
      const booking = await createTestBooking(user._id)

      const res = await request(app)
        .delete(`/api/bookings/${booking._id}`)
        .set('Authorization', `Bearer ${ownerToken}`)

      expect(res.status).toBe(200)
    })
  })

  describe('GET /api/bookings/summary', () => {
    it('should allow owner access', async () => {
      const res = await request(app)
        .get('/api/bookings/summary')
        .set('Authorization', `Bearer ${ownerToken}`)

      expect(res.status).toBe(200)
    })

    it('should deny user access', async () => {
      const res = await request(app)
        .get('/api/bookings/summary')
        .set('Authorization', `Bearer ${userToken}`)

      expect(res.status).toBe(403)
    })

    it('should deny admin access', async () => {
      const res = await request(app)
        .get('/api/bookings/summary')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(403)
    })
  })
})
