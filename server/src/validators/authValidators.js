const { body } = require('express-validator')

const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
]

module.exports = { loginRules }
