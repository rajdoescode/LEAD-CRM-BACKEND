import Client from '../models/Client.js';
import Lead from '../models/Lead.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { logActivity } from '../services/activityService.js';

/**
 * GET /api/clients
 * Fetch all clients with search, filtering, sorting, and pagination.
 */
const getAll = async (req, res) => {
  const {
    search = '',
    status,
    category,
    sort = 'createdAt',
    sortDir = 'desc',
    page = 1,
    limit = 25,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 25), 100);

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) filter.status = status;
  if (category) filter.category = category;

  const sortObj = {};
  sortObj[sort] = sortDir === 'asc' ? 1 : -1;

  const [clients, total] = await Promise.all([
    Client.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('lead', 'name email')
      .sort(sortObj)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Client.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  const transformed = clients.map((c) => {
    c.id = c._id;
    delete c._id;
    delete c.__v;
    return c;
  });

  ApiResponse.paginated(
    res,
    transformed,
    {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
    'Clients fetched successfully'
  );
};

/**
 * GET /api/clients/:id
 * Fetch a single client by ID.
 */
const getById = async (req, res) => {
  const client = await Client.findById(req.params.id)
    .populate('assignedTo', 'name email avatar')
    .populate('lead', 'name email phone');

  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  ApiResponse.success(res, client, 'Client fetched successfully');
};

/**
 * POST /api/clients
 * Create a new client (or convert a lead to client).
 */
const create = async (req, res) => {
  const client = await Client.create({
    ...req.body,
    assignedTo: req.body.assignedTo || req.user?._id,
  });

  // If converted from a lead, update the lead status
  if (req.body.lead) {
    await Lead.findByIdAndUpdate(req.body.lead, {
      status: 'won',
      convertedAt: new Date(),
    });

    await logActivity({
      type: 'lead_converted',
      description: `Lead converted to client "${client.name}"`,
      lead: req.body.lead,
      user: req.user?._id,
      metadata: { clientId: client._id },
    });
  }

  ApiResponse.created(res, client, 'Client created successfully');
};

/**
 * PUT /api/clients/:id
 * Update an existing client.
 */
const update = async (req, res) => {
  const client = await Client.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true, runValidators: true }
  )
    .populate('assignedTo', 'name email avatar')
    .populate('lead', 'name email');

  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  ApiResponse.success(res, client, 'Client updated successfully');
};

/**
 * DELETE /api/clients/:id
 * Delete a client.
 */
const remove = async (req, res) => {
  const client = await Client.findByIdAndDelete(req.params.id);

  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  ApiResponse.noContent(res, 'Client deleted successfully');
};

/**
 * GET /api/clients/:id/timeline
 * Get the full interaction timeline for a client.
 */
const getTimeline = async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  // Aggregate activities from the associated lead
  const Activity = (await import('../models/Activity.js')).default;
  const CallLog = (await import('../models/CallLog.js')).default;
  const Note = (await import('../models/Note.js')).default;
  const FollowUp = (await import('../models/FollowUp.js')).default;

  const leadId = client.lead;

  const [activities, calls, notes, followUps] = await Promise.all([
    leadId
      ? Activity.find({ lead: leadId }).sort({ createdAt: -1 }).limit(50).populate('user', 'name avatar').lean()
      : [],
    leadId
      ? CallLog.find({ lead: leadId }).sort({ callDate: -1 }).limit(20).populate('agent', 'name avatar').lean()
      : [],
    leadId
      ? Note.find({ lead: leadId }).sort({ createdAt: -1 }).limit(20).populate('author', 'name avatar').lean()
      : [],
    leadId
      ? FollowUp.find({ lead: leadId }).sort({ scheduledAt: -1 }).limit(20).populate('assignedTo', 'name avatar').lean()
      : [],
  ]);

  // Merge and sort all timeline items
  const timeline = [
    ...activities.map((a) => ({ ...a, id: a._id, _type: 'activity', _date: a.createdAt })),
    ...calls.map((c) => ({ ...c, id: c._id, _type: 'call', _date: c.callDate })),
    ...notes.map((n) => ({ ...n, id: n._id, _type: 'note', _date: n.createdAt })),
    ...followUps.map((f) => ({ ...f, id: f._id, _type: 'followUp', _date: f.scheduledAt })),
  ].sort((a, b) => new Date(b._date) - new Date(a._date));

  ApiResponse.success(res, timeline, 'Client timeline fetched');
};

export { getAll, getById, create, update, remove, getTimeline };
