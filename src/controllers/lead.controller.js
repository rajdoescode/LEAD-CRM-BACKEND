import Lead from '../models/Lead.js';
import StatusHistory from '../models/StatusHistory.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { logActivity } from '../services/activityService.js';

/**
 * GET /api/leads
 * Fetch all leads with search, filtering, sorting, and pagination.
 */
const getAll = async (req, res) => {
  const {
    search = '',
    status,
    source,
    sort = 'createdAt',
    sortDir = 'desc',
    dateFrom,
    page = 1,
    limit = 25,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 25), 100);

  // ─── Build filter ───────────────────────────────────────────
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) filter.status = status;
  if (source) filter.source = source;

  if (dateFrom) {
    const from = new Date(dateFrom);
    if (!isNaN(from.getTime())) {
      filter.createdAt = { $gte: from };
    }
  }

  // ─── Sort ───────────────────────────────────────────────────
  const sortObj = {};
  sortObj[sort] = sortDir === 'asc' ? 1 : -1;

  // ─── Query ──────────────────────────────────────────────────
  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .populate('assignedTo', 'name email avatar')
      .sort(sortObj)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Lead.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  // Transform _id to id for lean results
  const transformedLeads = leads.map((l) => {
    l.id = l._id;
    delete l._id;
    delete l.__v;
    return l;
  });

  ApiResponse.paginated(
    res,
    transformedLeads,
    {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
    'Leads fetched successfully'
  );
};

/**
 * GET /api/leads/:id
 * Fetch a single lead by ID.
 */
const getById = async (req, res) => {
  const lead = await Lead.findById(req.params.id)
    .populate('assignedTo', 'name email avatar');

  if (!lead) {
    throw ApiError.notFound('Lead not found');
  }

  ApiResponse.success(res, lead, 'Lead fetched successfully');
};

/**
 * POST /api/leads
 * Create a new lead.
 */
const create = async (req, res) => {
  const lead = await Lead.create({
    ...req.body,
    assignedTo: req.body.assignedTo || req.user?._id,
  });

  // Log initial status
  await StatusHistory.create({
    lead: lead._id,
    fromStatus: '',
    toStatus: lead.status,
    changedBy: req.user?._id,
    reason: 'Lead created',
  });

  await logActivity({
    type: 'lead_created',
    description: `New lead "${lead.name}" created`,
    lead: lead._id,
    user: req.user?._id,
  });

  ApiResponse.created(res, lead, 'Lead created successfully');
};

/**
 * PUT /api/leads/:id
 * Update an existing lead.
 */
const update = async (req, res) => {
  // Fetch old lead to detect status change
  const oldLead = await Lead.findById(req.params.id).lean();
  if (!oldLead) {
    throw ApiError.notFound('Lead not found');
  }

  const lead = await Lead.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true, runValidators: true }
  ).populate('assignedTo', 'name email avatar');

  // Log status change if status was updated
  if (req.body.status && req.body.status !== oldLead.status) {
    await StatusHistory.create({
      lead: lead._id,
      fromStatus: oldLead.status,
      toStatus: req.body.status,
      changedBy: req.user?._id,
      reason: req.body.statusChangeReason || '',
    });
  }

  await logActivity({
    type: 'lead_updated',
    description: `Lead "${lead.name}" updated`,
    lead: lead._id,
    user: req.user?._id,
    metadata: { updatedFields: Object.keys(req.body) },
  });

  ApiResponse.success(res, lead, 'Lead updated successfully');
};

/**
 * DELETE /api/leads/:id
 * Delete a single lead.
 */
const remove = async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);

  if (!lead) {
    throw ApiError.notFound('Lead not found');
  }

  // Clean up related status history
  await StatusHistory.deleteMany({ lead: lead._id });

  await logActivity({
    type: 'lead_updated',
    description: `Lead "${lead.name}" deleted`,
    user: req.user?._id,
    metadata: { deletedLeadId: lead._id },
  });

  ApiResponse.noContent(res, 'Lead deleted successfully');
};

/**
 * POST /api/leads/bulk-delete
 * Delete multiple leads by IDs.
 */
const bulkDelete = async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw ApiError.badRequest('An array of lead IDs is required', [
      { field: 'ids', message: 'Must be a non-empty array of lead IDs' },
    ]);
  }

  const result = await Lead.deleteMany({ _id: { $in: ids } });

  // Clean up related status history
  await StatusHistory.deleteMany({ lead: { $in: ids } });

  ApiResponse.success(
    res,
    { deletedCount: result.deletedCount },
    `${result.deletedCount} lead(s) deleted successfully`
  );
};

export {
  getAll,
  getById,
  create,
  update,
  remove,
  bulkDelete,
};
