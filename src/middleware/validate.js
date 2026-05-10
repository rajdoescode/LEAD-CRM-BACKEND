import { body, param, query, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Middleware that checks express-validator results and throws ApiError if invalid.
 */
const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    throw ApiError.badRequest('Validation failed', formattedErrors);
  }
  next();
};

// ─── Lead Validators ─────────────────────────────────────────────
const validateCreateLead = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone').notEmpty().withMessage('Phone number is required').trim()
    .matches(/^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/).withMessage('Enter a valid Indian phone number'),
  body('source').optional().isIn(['Website', 'Referral', 'LinkedIn', 'Cold Email', 'Conference', 'Trade Show', 'Partner', 'Other']),
  body('status').optional().isIn(['new', 'contacted', 'interested', 'qualified', 'proposal', 'negotiation', 'follow-up', 'won', 'lost']),
  body('score').optional().isInt({ min: 0, max: 100 }),
  validate,
];

const validateUpdateLead = [
  param('id').isMongoId().withMessage('Invalid lead ID'),
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone').optional().trim()
    .matches(/^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/).withMessage('Enter a valid Indian phone number'),
  body('score').optional().isInt({ min: 0, max: 100 }),
  validate,
];

// ─── Call Log Validators ────────────────────────────────────────
const validateCreateCallLog = [
  body('remarks').notEmpty().withMessage('Call remarks are required').trim(),
  body('callType').optional().isIn(['inbound', 'outbound', 'missed', 'voicemail']),
  body('status').optional().isIn(['completed', 'no-answer', 'busy', 'failed', 'scheduled']),
  body('outcome').optional().isIn(['interested', 'not-interested', 'callback', 'voicemail', 'converted', 'follow-up', 'no-response']),
  body('duration').optional().isInt({ min: 0 }),
  validate,
];

// ─── Task Validators ────────────────────────────────────────────
const validateCreateTask = [
  body('title').notEmpty().withMessage('Task title is required').trim(),
  body('status').optional().isIn(['pending', 'in-progress', 'completed', 'cancelled']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  validate,
];

// ─── Note Validators ────────────────────────────────────────────
const validateCreateNote = [
  body('content').notEmpty().withMessage('Note content is required').trim(),
  body('type').optional().isIn(['general', 'meeting', 'call', 'email', 'reminder']),
  validate,
];

// ─── FollowUp Validators ────────────────────────────────────────
const validateCreateFollowUp = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('scheduledAt').notEmpty().withMessage('Scheduled date is required').isISO8601(),
  body('type').optional().isIn(['call', 'email', 'meeting', 'visit', 'other']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  validate,
];

// ─── Deal Validators ────────────────────────────────────────────
const validateCreateDeal = [
  body('title').notEmpty().withMessage('Deal title is required').trim(),
  body('value').optional().isFloat({ min: 0 }),
  body('stage').optional().isIn(['new', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost']),
  body('probability').optional().isInt({ min: 0, max: 100 }),
  validate,
];

// ─── Client Validators ──────────────────────────────────────────
const validateCreateClient = [
  body('name').notEmpty().withMessage('Client name is required').trim(),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('status').optional().isIn(['active', 'inactive', 'churned']),
  body('category').optional().isIn(['individual', 'business', 'enterprise', 'government']),
  validate,
];

// ─── Auth Validators ────────────────────────────────────────────
const validateVerifyPin = [
  body('pin').notEmpty().withMessage('PIN is required'),
  validate,
];

// ─── ID Validator ───────────────────────────────────────────────
const validateMongoId = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate,
];

const validateLeadId = [
  param('leadId').isMongoId().withMessage('Invalid lead ID format'),
  validate,
];

export {
  validate,
  validateCreateLead,
  validateUpdateLead,
  validateCreateCallLog,
  validateCreateTask,
  validateCreateNote,
  validateCreateFollowUp,
  validateCreateDeal,
  validateCreateClient,
  validateVerifyPin,
  validateMongoId,
  validateLeadId,
};
