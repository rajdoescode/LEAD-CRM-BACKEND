import { readJSON, writeJSON } from '../utils/fileHelper.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import paginate from '../utils/paginate.js';

const LEADS_FILE = 'leads.json';

/**
 * GET /api/leads
 * Fetch all leads with search, filtering, sorting, and pagination.
 */
const getAll = (req, res) => {
  const { search = '', status, source, sort = 'createdAt', sortDir = 'desc', dateFrom } = req.query;
  let filtered = readJSON(LEADS_FILE);

  // ─── Search ─────────────────────────────────────────────────
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.name.toLowerCase().includes(s) ||
        l.email.toLowerCase().includes(s) ||
        l.company.toLowerCase().includes(s)
    );
  }

  // ─── Filter ─────────────────────────────────────────────────
  if (status) filtered = filtered.filter((l) => l.status === status);
  if (source) filtered = filtered.filter((l) => l.source === source);

  // ─── Date Filter ────────────────────────────────────────────
  if (dateFrom) {
    const from = new Date(dateFrom);
    if (!isNaN(from.getTime())) {
      filtered = filtered.filter(l => new Date(l.createdAt) >= from);
    }
  }

  // ─── Sort ───────────────────────────────────────────────────
  filtered.sort((a, b) => {
    let result;
    if (sort === 'score')      result = a.score - b.score;
    else if (sort === 'value') result = a.value - b.value;
    else                       result = new Date(a.createdAt) - new Date(b.createdAt);
    return sortDir === 'asc' ? result : -result;
  });

  // ─── Paginate ───────────────────────────────────────────────
  const { items, pagination } = paginate(filtered, req.query);

  ApiResponse.paginated(res, items, pagination, 'Leads fetched successfully');
};

/**
 * GET /api/leads/:id
 * Fetch a single lead by ID.
 */
const getById = (req, res) => {
  const lead = readJSON(LEADS_FILE).find((l) => l.id === req.params.id);

  if (!lead) {
    throw ApiError.notFound('Lead not found');
  }

  ApiResponse.success(res, lead, 'Lead fetched successfully');
};

/**
 * POST /api/leads
 * Create a new lead.
 */
const create = (req, res) => {
  const { name, email, company } = req.body;

  if (!name || !email) {
    throw ApiError.badRequest('Name and email are required', [
      ...(!name ? [{ field: 'name', message: 'Name is required' }] : []),
      ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
    ]);
  }

  const leads = readJSON(LEADS_FILE);

  const newLead = {
    id: `lead_${Date.now()}`,
    name,
    email,
    company: company || '',
    ...req.body,
    score: req.body.score || 0,
    notes: [],
    activities: [],
    tags: req.body.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  leads.push(newLead);
  writeJSON(LEADS_FILE, leads);

  ApiResponse.created(res, newLead, 'Lead created successfully');
};

/**
 * PUT /api/leads/:id
 * Update an existing lead.
 */
const update = (req, res) => {
  const leads = readJSON(LEADS_FILE);
  const idx = leads.findIndex((l) => l.id === req.params.id);

  if (idx === -1) {
    throw ApiError.notFound('Lead not found');
  }

  leads[idx] = { ...leads[idx], ...req.body, updatedAt: new Date().toISOString() };
  writeJSON(LEADS_FILE, leads);

  ApiResponse.success(res, leads[idx], 'Lead updated successfully');
};

/**
 * DELETE /api/leads/:id
 * Delete a single lead.
 */
const remove = (req, res) => {
  const leads = readJSON(LEADS_FILE);
  const idx = leads.findIndex((l) => l.id === req.params.id);

  if (idx === -1) {
    throw ApiError.notFound('Lead not found');
  }

  leads.splice(idx, 1);
  writeJSON(LEADS_FILE, leads);

  ApiResponse.noContent(res, 'Lead deleted successfully');
};

/**
 * POST /api/leads/bulk-delete
 * Delete multiple leads by IDs.
 */
const bulkDelete = (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw ApiError.badRequest('An array of lead IDs is required', [
      { field: 'ids', message: 'Must be a non-empty array of lead IDs' },
    ]);
  }

  const leads = readJSON(LEADS_FILE);
  const remaining = leads.filter((l) => !ids.includes(l.id));
  const deletedCount = leads.length - remaining.length;
  writeJSON(LEADS_FILE, remaining);

  ApiResponse.success(res, { deletedCount }, `${deletedCount} lead(s) deleted successfully`);
};

export {
  getAll,
  getById,
  create,
  update,
  remove,
  bulkDelete
};
