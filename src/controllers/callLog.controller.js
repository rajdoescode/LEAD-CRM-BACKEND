import CallLog from '../models/CallLog.js';
import Lead from '../models/Lead.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { logActivity } from '../services/activityService.js';

/**
 * GET /api/leads/:leadId/calls
 * Fetch all call logs for a specific lead.
 */
const getByLeadId = async (req, res) => {
  const { leadId } = req.params;

  const logs = await CallLog.find({ lead: leadId })
    .populate('agent', 'name email avatar')
    .sort({ callDate: -1 })
    .lean();

  // Transform _id to id
  const transformed = logs.map((l) => {
    l.id = l._id;
    l.leadId = l.lead;
    delete l._id;
    delete l.__v;
    return l;
  });

  ApiResponse.success(res, transformed, 'Call logs fetched successfully');
};

/**
 * POST /api/leads/:leadId/calls
 * Create a new call log entry for a lead.
 */
const create = async (req, res) => {
  const { leadId } = req.params;

  // Verify lead exists
  const lead = await Lead.findById(leadId);
  if (!lead) {
    throw ApiError.notFound('Lead not found');
  }

  const callLog = await CallLog.create({
    ...req.body,
    lead: leadId,
    agent: req.body.agentId || req.user?._id,
  });

  // Update lead's last contacted date
  lead.lastContactedAt = new Date();
  if (req.body.followUpDate) {
    lead.nextFollowUpAt = new Date(req.body.followUpDate);
  }
  await lead.save({ validateBeforeSave: false });

  await logActivity({
    type: 'call_logged',
    description: `Call logged for "${lead.name}" - ${callLog.outcome}`,
    lead: leadId,
    user: req.user?._id,
    metadata: { callType: callLog.callType, outcome: callLog.outcome, duration: callLog.duration },
  });

  ApiResponse.created(res, callLog, 'Call log created successfully');
};

/**
 * PUT /api/leads/:leadId/calls/:callId
 * Update an existing call log entry.
 */
const update = async (req, res) => {
  const { callId } = req.params;

  const callLog = await CallLog.findByIdAndUpdate(
    callId,
    { ...req.body },
    { new: true, runValidators: true }
  ).populate('agent', 'name email avatar');

  if (!callLog) {
    throw ApiError.notFound('Call log not found');
  }

  ApiResponse.success(res, callLog, 'Call log updated successfully');
};

/**
 * DELETE /api/leads/:leadId/calls/:callId
 * Delete a call log entry.
 */
const remove = async (req, res) => {
  const { callId } = req.params;

  const callLog = await CallLog.findByIdAndDelete(callId);

  if (!callLog) {
    throw ApiError.notFound('Call log not found');
  }

  ApiResponse.noContent(res, 'Call log deleted successfully');
};

export { getByLeadId, create, update, remove };
