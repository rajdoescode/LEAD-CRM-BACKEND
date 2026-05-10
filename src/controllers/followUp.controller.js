import FollowUp from '../models/FollowUp.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { logActivity } from '../services/activityService.js';

const getAll = async (req, res) => {
  const { status, priority, page = 1, limit = 25 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 25), 100);

  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const [items, total] = await Promise.all([
    FollowUp.find(filter).populate('lead', 'name email phone').populate('assignedTo', 'name email avatar')
      .sort({ scheduledAt: 1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
    FollowUp.countDocuments(filter),
  ]);

  const transformed = items.map((f) => { f.id = f._id; delete f._id; delete f.__v; return f; });
  const totalPages = Math.ceil(total / limitNum);
  ApiResponse.paginated(res, transformed, { page: pageNum, limit: limitNum, total, totalPages, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1 }, 'Follow-ups fetched');
};

const getByLeadId = async (req, res) => {
  const items = await FollowUp.find({ lead: req.params.leadId }).populate('assignedTo', 'name email avatar').sort({ scheduledAt: 1 }).lean();
  const transformed = items.map((f) => { f.id = f._id; delete f._id; delete f.__v; return f; });
  ApiResponse.success(res, transformed, 'Follow-ups fetched');
};

const create = async (req, res) => {
  const followUp = await FollowUp.create({ ...req.body, lead: req.body.leadId || req.params.leadId, assignedTo: req.body.assignedTo || req.user?._id });
  await logActivity({ type: 'follow_up_scheduled', description: `Follow-up "${followUp.title}" scheduled`, lead: followUp.lead, user: req.user?._id });
  ApiResponse.created(res, followUp, 'Follow-up created');
};

const update = async (req, res) => {
  if (req.body.status === 'completed' && !req.body.completedAt) req.body.completedAt = new Date();
  const followUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('lead', 'name email phone').populate('assignedTo', 'name email avatar');
  if (!followUp) throw ApiError.notFound('Follow-up not found');
  if (req.body.status === 'completed') {
    await logActivity({ type: 'follow_up_completed', description: `Follow-up "${followUp.title}" completed`, lead: followUp.lead?._id, user: req.user?._id });
  }
  ApiResponse.success(res, followUp, 'Follow-up updated');
};

const remove = async (req, res) => {
  const followUp = await FollowUp.findByIdAndDelete(req.params.id);
  if (!followUp) throw ApiError.notFound('Follow-up not found');
  ApiResponse.noContent(res, 'Follow-up deleted');
};

export { getAll, getByLeadId, create, update, remove };
