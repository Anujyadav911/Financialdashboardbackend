const recordService = require('../services/record.service');

/**
 * POST /api/v1/records
 * Admin and Analyst — create a new financial record.
 */
const createRecord = async (req, res, next) => {
  try {
    const record = await recordService.createRecord(req.body, req.user._id);
    res.status(201).json({
      success: true,
      message: 'Financial record created successfully.',
      data: { record },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/records
 * All roles — with filtering, sorting, pagination.
 * Admins see all records; others see only their own.
 */
const getRecords = async (req, res, next) => {
  try {
    const result = await recordService.getRecords(req.query, req.user);
    res.status(200).json({
      success: true,
      message: 'Records retrieved successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/records/:id
 * All roles — single record (ownership enforced).
 */
const getRecordById = async (req, res, next) => {
  try {
    const record = await recordService.getRecordById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: { record },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/records/:id
 * Admin and Analyst — update a record (ownership enforced for analyst).
 */
const updateRecord = async (req, res, next) => {
  try {
    const record = await recordService.updateRecord(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: 'Financial record updated successfully.',
      data: { record },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/records/:id
 * Admin and Analyst — soft-delete a record (ownership enforced for analyst).
 */
const deleteRecord = async (req, res, next) => {
  try {
    const result = await recordService.deleteRecord(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };
