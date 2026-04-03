const express = require('express');
const router = express.Router();

const recordController = require('../controllers/record.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate');
const {
  createRecordValidator,
  updateRecordValidator,
  recordQueryValidator,
  mongoIdValidator,
} = require('../validators');

// All record routes require authentication
router.use(protect);

/**
 * @route   POST /api/v1/records
 * @desc    Create a new financial record
 * @access  Admin, Analyst
 */
router.post(
  '/',
  authorize('admin', 'analyst'),
  createRecordValidator,
  validate,
  recordController.createRecord
);

/**
 * @route   GET /api/v1/records
 * @desc    List records with filtering, sorting, pagination
 * @access  All roles (viewer sees own; analyst sees own; admin sees all or by userId)
 */
router.get('/', recordQueryValidator, validate, recordController.getRecords);

/**
 * @route   GET /api/v1/records/:id
 * @desc    Get a single financial record by ID
 * @access  All roles (ownership enforced for non-admins)
 */
router.get('/:id', mongoIdValidator('id'), validate, recordController.getRecordById);

/**
 * @route   PUT /api/v1/records/:id
 * @desc    Update a financial record
 * @access  Admin, Analyst (analyst: own records only)
 */
router.put(
  '/:id',
  authorize('admin', 'analyst'),
  mongoIdValidator('id'),
  updateRecordValidator,
  validate,
  recordController.updateRecord
);

/**
 * @route   DELETE /api/v1/records/:id
 * @desc    Soft-delete a financial record
 * @access  Admin, Analyst (analyst: own records only)
 */
router.delete(
  '/:id',
  authorize('admin', 'analyst'),
  mongoIdValidator('id'),
  validate,
  recordController.deleteRecord
);

module.exports = router;
