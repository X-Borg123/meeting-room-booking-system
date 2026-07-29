const request = require('supertest')
const app = require('../src/app')
const { createTestUser, getAuthToken } = require('./helpers')

require('./setup')

process.env.JWT_SECRET = 'testsecret'

describe('Auth Endpoints', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await createTestUser({ email: 'login@test.com' })

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@test.com', password: 'password123' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.token).toBeDefined()
      expect(res.body.user.email).toBe('login@test.com')
    })

    it('should return 404 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nope@test.com', password: 'password123' })

      expect(res.status).toBe(404)
    })

    it('should return 401 for wrong password', async () => {
      await createTestUser({ email: 'wrong@test.com' })

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@test.com', password: 'wrongpass' })

      expect(res.status).toBe(401)
    })

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: '' })

      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const user = await createTestUser({ email: 'me@test.com' })
      const token = getAuthToken(user)

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.user.email).toBe('me@test.com')
    })

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me')
      expect(res.status).toBe(401)
    })

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken')

      expect(res.status).toBe(401)
    })
  })
})
