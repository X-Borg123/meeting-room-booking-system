const { body } = require('express-validator')

const PASSWORD_POLICY_MESSAGE =
  'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/

const createUserRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .matches(STRONG_PASSWORD_REGEX)
    .withMessage(PASSWORD_POLICY_MESSAGE),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'owner', 'user'])
    .withMessage('Role must be admin, owner, or user'),
]

const updateRoleRules = [
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'owner', 'user'])
    .withMessage('Role must be admin, owner, or user'),
]

module.exports = { createUserRules, updateRoleRules }
