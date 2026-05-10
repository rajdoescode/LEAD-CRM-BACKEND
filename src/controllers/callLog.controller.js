import { readJSON, writeJSON } from '../utils/fileHelper.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

const CALL_LOGS_FILE = 'callLogs.json';

/**
 * GET /api/leads/:leadId/calls
 * Fetch all call logs for a specific lead.
 */
const getByLeadId = (req, res) => {
  const { leadId } = req.params;
  const logs = readJSON(CALL_LOGS_FILE)
    .filter((c) => c.leadId === leadId)
    .sort((a, b) => new Date(b.callDate) - new Date(a.callDate));

  ApiResponse.success(res, logs, 'Call logs fetched successfully');
};

/**
 * POST /api/leads/:leadId/calls
 * Create a new call log entry for a lead.
 */
const create = (req, res) => {
  const { leadId } = req.params;
  const { remarks, callType, status, outcome } = req.body;

  if (!remarks?.trim()) {
    throw ApiError.badRequest('Call remarks are required', [
      { field: 'remarks', message: 'Remarks cannot be empty' },
    ]);
  }

  const logs = readJSON(CALL_LOGS_FILE);

  const newLog = {
    id: `call_${Date.now()}`,
    leadId,
    callDate: req.body.callDate || new Date().toISOString(),
    duration: req.body.duration || 0,
    callType: callType || 'outbound',
    status: status || 'completed',
    outcome: outcome || 'interested',
    remarks: remarks.trim(),
    followUpDate: req.body.followUpDate || null,
    followUpNotes: req.body.followUpNotes || '',
    agentName: req.body.agentName || 'Current User',
    agentId: req.body.agentId || 'user_1',
    policyType: req.body.policyType || '',
    policyNumber: req.body.policyNumber || '',
    premium: req.body.premium || 0,
    createdAt: new Date().toISOString(),
  };

  logs.push(newLog);
  writeJSON(CALL_LOGS_FILE, logs);

  ApiResponse.created(res, newLog, 'Call log created successfully');
};

/**
 * PUT /api/leads/:leadId/calls/:callId
 * Update an existing call log entry.
 */
const update = (req, res) => {
  const { callId } = req.params;
  const logs = readJSON(CALL_LOGS_FILE);
  const idx = logs.findIndex((c) => c.id === callId);

  if (idx === -1) {
    throw ApiError.notFound('Call log not found');
  }

  logs[idx] = { ...logs[idx], ...req.body, updatedAt: new Date().toISOString() };
  writeJSON(CALL_LOGS_FILE, logs);

  ApiResponse.success(res, logs[idx], 'Call log updated successfully');
};

/**
 * DELETE /api/leads/:leadId/calls/:callId
 * Delete a call log entry.
 */
const remove = (req, res) => {
  const { callId } = req.params;
  const logs = readJSON(CALL_LOGS_FILE);
  const idx = logs.findIndex((c) => c.id === callId);

  if (idx === -1) {
    throw ApiError.notFound('Call log not found');
  }

  logs.splice(idx, 1);
  writeJSON(CALL_LOGS_FILE, logs);

  ApiResponse.noContent(res, 'Call log deleted successfully');
};

export { getByLeadId, create, update, remove };
