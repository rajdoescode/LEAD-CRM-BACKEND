import { readJSON } from '../utils/fileHelper.js';
import ApiResponse from '../utils/ApiResponse.js';
import paginate from '../utils/paginate.js';

const ANALYTICS_FILE = 'analytics.json';
const ACTIVITIES_FILE = 'activities.json';

/**
 * GET /api/analytics
 * Fetch the complete analytics dataset.
 */
const getAll = (_req, res) => {
  const analytics = readJSON(ANALYTICS_FILE);
  ApiResponse.success(res, analytics, 'Analytics fetched successfully');
};

/**
 * GET /api/analytics/kpis
 * Fetch KPI metrics only.
 */
const getKpis = (_req, res) => {
  const { kpis } = readJSON(ANALYTICS_FILE);
  ApiResponse.success(res, kpis, 'KPIs fetched successfully');
};

/**
 * GET /api/analytics/revenue
 * Fetch revenue data.
 */
const getRevenue = (_req, res) => {
  const { revenue } = readJSON(ANALYTICS_FILE);
  ApiResponse.success(res, revenue, 'Revenue data fetched successfully');
};

/**
 * GET /api/analytics/sources
 * Fetch lead source distribution.
 */
const getSources = (_req, res) => {
  const { leadSources } = readJSON(ANALYTICS_FILE);
  ApiResponse.success(res, leadSources, 'Lead sources fetched successfully');
};

/**
 * GET /api/analytics/funnel
 * Fetch conversion funnel data.
 */
const getFunnel = (_req, res) => {
  const { conversionFunnel } = readJSON(ANALYTICS_FILE);
  ApiResponse.success(res, conversionFunnel, 'Conversion funnel fetched successfully');
};

/**
 * GET /api/analytics/activities
 * Fetch recent activities with optional pagination.
 */
const getActivities = (req, res) => {
  const sorted = [...readJSON(ACTIVITIES_FILE)].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const { items, pagination } = paginate(sorted, req.query);
  ApiResponse.paginated(res, items, pagination, 'Activities fetched successfully');
};

export {
  getAll,
  getKpis,
  getRevenue,
  getSources,
  getFunnel,
  getActivities
};
