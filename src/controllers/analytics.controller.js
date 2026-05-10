import Lead from '../models/Lead.js';
import CallLog from '../models/CallLog.js';
import Deal from '../models/Deal.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import Client from '../models/Client.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Compute percentage change between two values.
 * Returns a formatted string like "+12%" or "-5%".
 */
const computeChange = (current, previous) => {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const change = Math.round(((current - previous) / previous) * 100);
  return change >= 0 ? `+${change}%` : `${change}%`;
};

const getAll = async (_req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    totalLeads,
    leadsThisMonth,
    leadsPrevMonth,
    activeDeals,
    activeDealsThisMonth,
    activeDealsPrevMonth,
    wonDeals,
    wonDealsThisMonth,
    wonDealsPrevMonth,
    activities,
    totalClients,
  ] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Lead.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
    Deal.countDocuments({ stage: { $nin: ['closed-won', 'closed-lost'] } }),
    Deal.countDocuments({ stage: { $nin: ['closed-won', 'closed-lost'] }, createdAt: { $gte: thirtyDaysAgo } }),
    Deal.countDocuments({ stage: { $nin: ['closed-won', 'closed-lost'] }, createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
    Deal.find({ stage: 'closed-won' }).lean(),
    Deal.find({ stage: 'closed-won', closedAt: { $gte: thirtyDaysAgo } }).lean(),
    Deal.find({ stage: 'closed-won', closedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }).lean(),
    Activity.find().sort({ createdAt: -1 }).limit(20).populate('user', 'name avatar').populate('lead', 'name').lean(),
    Client.countDocuments(),
  ]);

  const totalRevenue = wonDeals.reduce((s, d) => s + (d.value || 0), 0);
  const revenueThisMonth = wonDealsThisMonth.reduce((s, d) => s + (d.value || 0), 0);
  const revenuePrevMonth = wonDealsPrevMonth.reduce((s, d) => s + (d.value || 0), 0);
  const conversionRate = totalLeads > 0 ? Math.round((wonDeals.length / totalLeads) * 100) : 0;
  const prevConversionRate = leadsPrevMonth > 0 ? Math.round((wonDealsPrevMonth.length / leadsPrevMonth) * 100) : 0;

  // Lead sources aggregation
  const leadSources = await Lead.aggregate([
    { $group: { _id: '$source', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  const sourcesFormatted = leadSources.map((s) => ({
    source: s._id || 'Unknown',
    count: s.count,
    percentage: totalLeads > 0 ? Math.round((s.count / totalLeads) * 100) : 0,
  }));

  // Monthly revenue (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyRevenue = await Deal.aggregate([
    { $match: { stage: 'closed-won', closedAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { $month: '$closedAt' }, value: { $sum: '$value' } } },
    { $sort: { _id: 1 } },
  ]);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueData = monthlyRevenue.map((m) => ({ month: months[m._id - 1], value: m.value }));

  // Conversion funnel
  const funnel = await Lead.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Call statistics
  const callStats = await CallLog.aggregate([
    { $match: { callDate: { $gte: thirtyDaysAgo } } },
    { $group: {
      _id: null,
      totalCalls: { $sum: 1 },
      totalDuration: { $sum: '$duration' },
      avgDuration: { $avg: '$duration' },
    }},
  ]);

  const analytics = {
    kpis: {
      totalLeads,
      activeDeals,
      totalRevenue,
      conversionRate,
      totalClients,
      totalLeadsChange: computeChange(leadsThisMonth, leadsPrevMonth),
      activeDealsChange: computeChange(activeDealsThisMonth, activeDealsPrevMonth),
      totalRevenueChange: computeChange(revenueThisMonth, revenuePrevMonth),
      conversionRateChange: computeChange(conversionRate, prevConversionRate),
    },
    leadSources: sourcesFormatted,
    revenue: { monthly: revenueData },
    conversionFunnel: funnel.map((f) => ({ stage: f._id, count: f.count })),
    callStats: callStats[0] || { totalCalls: 0, totalDuration: 0, avgDuration: 0 },
  };

  ApiResponse.success(res, analytics, 'Analytics fetched');
};

const getKpis = async (_req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [totalLeads, leadsThisMonth, leadsPrevMonth, activeDeals, wonDeals] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Lead.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
    Deal.countDocuments({ stage: { $nin: ['closed-won', 'closed-lost'] } }),
    Deal.find({ stage: 'closed-won' }).lean(),
  ]);
  const totalRevenue = wonDeals.reduce((s, d) => s + (d.value || 0), 0);
  const conversionRate = totalLeads > 0 ? Math.round((wonDeals.length / totalLeads) * 100) : 0;
  ApiResponse.success(res, {
    totalLeads, activeDeals, totalRevenue, conversionRate,
    totalLeadsChange: computeChange(leadsThisMonth, leadsPrevMonth),
  }, 'KPIs fetched');
};

const getRevenue = async (_req, res) => {
  const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const data = await Deal.aggregate([
    { $match: { stage: 'closed-won', closedAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { $month: '$closedAt' }, value: { $sum: '$value' } } },
    { $sort: { _id: 1 } },
  ]);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  ApiResponse.success(res, { monthly: data.map((m) => ({ month: months[m._id - 1], value: m.value })) }, 'Revenue fetched');
};

const getSources = async (_req, res) => {
  const total = await Lead.countDocuments();
  const sources = await Lead.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
  ApiResponse.success(res, sources.map((s) => ({ source: s._id || 'Unknown', count: s.count, percentage: total > 0 ? Math.round((s.count / total) * 100) : 0 })), 'Sources fetched');
};

const getFunnel = async (_req, res) => {
  const funnel = await Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  ApiResponse.success(res, funnel.map((f) => ({ stage: f._id, count: f.count })), 'Funnel fetched');
};

const getActivities = async (req, res) => {
  const { page = 1, limit = 25 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 25), 100);

  const [items, total] = await Promise.all([
    Activity.find().sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum)
      .populate('user', 'name avatar').populate('lead', 'name').lean(),
    Activity.countDocuments(),
  ]);

  const transformed = items.map((a) => { a.id = a._id; delete a._id; delete a.__v; return a; });
  const totalPages = Math.ceil(total / limitNum);

  ApiResponse.paginated(res, transformed, { page: pageNum, limit: limitNum, total, totalPages, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1 }, 'Activities fetched');
};

export { getAll, getKpis, getRevenue, getSources, getFunnel, getActivities };
