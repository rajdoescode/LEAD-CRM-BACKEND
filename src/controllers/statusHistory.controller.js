import StatusHistory from '../models/StatusHistory.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

/**
 * GET /api/leads/:leadId/status-history
 * Fetch status change history for a specific lead.
 */
const getByLeadId = async (req, res) => {
  const { leadId } = req.params;

  const history = await StatusHistory.find({ lead: leadId })
    .populate('changedBy', 'name email avatar')
    .sort({ createdAt: -1 })
    .lean();

  const transformed = history.map((h) => {
    h.id = h._id;
    delete h._id;
    delete h.__v;
    return h;
  });

  ApiResponse.success(res, transformed, 'Status history fetched');
};

/**
 * POST /api/leads/:leadId/status-history
 * Manually create a status history entry (typically auto-created by lead controller).
 */
const create = async (req, res) => {
  const { leadId } = req.params;

  const entry = await StatusHistory.create({
    ...req.body,
    lead: leadId,
    changedBy: req.user?._id,
  });

  ApiResponse.created(res, entry, 'Status history entry created');
};

export { getByLeadId, create };
