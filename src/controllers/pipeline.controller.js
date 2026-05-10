import Deal from '../models/Deal.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { logActivity } from '../services/activityService.js';

const PIPELINE_STAGES = [
  { id: 'new', name: 'New', color: '#3B82F6', order: 1 },
  { id: 'qualified', name: 'Qualified', color: '#8B5CF6', order: 2 },
  { id: 'proposal', name: 'Proposal', color: '#F59E0B', order: 3 },
  { id: 'negotiation', name: 'Negotiation', color: '#EC4899', order: 4 },
  { id: 'closed-won', name: 'Closed Won', color: '#10B981', order: 5 },
  { id: 'closed-lost', name: 'Closed Lost', color: '#EF4444', order: 6 },
];

const getAll = async (_req, res) => {
  const deals = await Deal.find()
    .populate('lead', 'name email phone')
    .populate('assignedTo', 'name email avatar')
    .sort({ createdAt: -1 }).lean();
  const transformed = deals.map((d) => { d.id = d._id; delete d._id; delete d.__v; return d; });
  ApiResponse.success(res, { stages: PIPELINE_STAGES, deals: transformed }, 'Pipeline fetched');
};

const getStages = (_req, res) => { ApiResponse.success(res, PIPELINE_STAGES, 'Stages fetched'); };

const getDeals = async (_req, res) => {
  const deals = await Deal.find().populate('lead', 'name email phone').populate('assignedTo', 'name email avatar').sort({ createdAt: -1 });
  ApiResponse.success(res, deals, 'Deals fetched');
};

const updateDealStage = async (req, res) => {
  const { stage } = req.body;
  if (!stage) throw ApiError.badRequest('Stage is required');
  const extras = (stage === 'closed-won' || stage === 'closed-lost') ? { closedAt: new Date() } : {};
  const deal = await Deal.findByIdAndUpdate(req.params.id, { stage, ...extras }, { new: true, runValidators: true })
    .populate('lead', 'name email phone').populate('assignedTo', 'name email avatar');
  if (!deal) throw ApiError.notFound('Deal not found');
  await logActivity({ type: 'deal_stage_changed', description: `Deal "${deal.title}" → ${stage}`, lead: deal.lead?._id, user: req.user?._id });
  ApiResponse.success(res, deal, 'Deal stage updated');
};

const createDeal = async (req, res) => {
  const deal = await Deal.create({ ...req.body, stage: req.body.stage || 'new', assignedTo: req.body.assignedTo || req.user?._id });
  await logActivity({ type: 'deal_created', description: `Deal "${deal.title}" created`, lead: deal.lead, user: req.user?._id });
  ApiResponse.created(res, deal, 'Deal created');
};

const updateDeal = async (req, res) => {
  const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('lead', 'name email phone').populate('assignedTo', 'name email avatar');
  if (!deal) throw ApiError.notFound('Deal not found');
  ApiResponse.success(res, deal, 'Deal updated');
};

const deleteDeal = async (req, res) => {
  const deal = await Deal.findByIdAndDelete(req.params.id);
  if (!deal) throw ApiError.notFound('Deal not found');
  ApiResponse.noContent(res, 'Deal deleted');
};

export { getAll, getStages, getDeals, updateDealStage, createDeal, updateDeal, deleteDeal };
