const { body, query, param } = require('express-validator');
const FinancialRecord = require('../models/record.model');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),

  body('role')
    .optional()
    .isIn(['viewer', 'analyst', 'admin']).withMessage('Role must be one of: viewer, analyst, admin'),
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

const updateUserValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('role')
    .optional()
    .isIn(['viewer', 'analyst', 'admin']).withMessage('Role must be one of: viewer, analyst, admin'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

const createRecordValidator = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),

  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(FinancialRecord.TYPES).withMessage('Type must be income or expense'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(FinancialRecord.CATEGORIES).withMessage(`Category must be one of: ${FinancialRecord.CATEGORIES.join(', ')}`),

  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

const updateRecordValidator = [
  body('amount')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),

  body('type')
    .optional()
    .isIn(FinancialRecord.TYPES).withMessage('Type must be income or expense'),

  body('category')
    .optional()
    .isIn(FinancialRecord.CATEGORIES).withMessage(`Category must be one of: ${FinancialRecord.CATEGORIES.join(', ')}`),

  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

const recordQueryValidator = [
  query('type')
    .optional()
    .isIn(FinancialRecord.TYPES).withMessage('Type must be income or expense'),

  query('category')
    .optional()
    .isIn(FinancialRecord.CATEGORIES).withMessage('Invalid category'),

  query('startDate')
    .optional()
    .isISO8601().withMessage('startDate must be a valid ISO 8601 date'),

  query('endDate')
    .optional()
    .isISO8601().withMessage('endDate must be a valid ISO 8601 date'),

  query('minAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('minAmount must be a non-negative number'),

  query('maxAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('maxAmount must be a non-negative number'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('sort')
    .optional()
    .isIn(['date', '-date', 'amount', '-amount', 'category', '-category', 'type', '-type'])
    .withMessage('Invalid sort field'),
];

const mongoIdValidator = (paramName = 'id') => [
  param(paramName)
    .isMongoId().withMessage(`${paramName} must be a valid MongoDB ObjectId`),
];

module.exports = {
  registerValidator,
  loginValidator,
  updateUserValidator,
  createRecordValidator,
  updateRecordValidator,
  recordQueryValidator,
  mongoIdValidator,
};
