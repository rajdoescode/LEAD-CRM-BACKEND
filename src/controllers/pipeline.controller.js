import { readJSON, writeJSON } from '../utils/fileHelper.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

const PIPELINE_FILE = 'pipeline.json';

/**
 * GET /api/pipeline
 * Fetch the full pipeline (stages + deals).
 */
const getAll = (_req, res) => {
  const pipeline = readJSON(PIPELINE_FILE);
  ApiResponse.success(res, pipeline, 'Pipeline fetched successfully');
};

/**
 * GET /api/pipeline/stages
 * Fetch pipeline stages only.
 */
const getStages = (_req, res) => {
  const { stages } = readJSON(PIPELINE_FILE);
  ApiResponse.success(res, stages, 'Pipeline stages fetched successfully');
};

/**
 * GET /api/pipeline/deals
 * Fetch all deals.
 */
const getDeals = (_req, res) => {
  const { deals } = readJSON(PIPELINE_FILE);
  ApiResponse.success(res, deals, 'Deals fetched successfully');
};

/**
 * PUT /api/pipeline/deals/:id/stage
 * Move a deal to a different pipeline stage.
 */
const updateDealStage = (req, res) => {
  const { stage } = req.body;

  if (!stage) {
    throw ApiError.badRequest('Stage is required', [
      { field: 'stage', message: 'Stage is required' },
    ]);
  }

  const pipeline = readJSON(PIPELINE_FILE);
  const deal = pipeline.deals.find((d) => d.id === req.params.id);

  if (!deal) {
    throw ApiError.notFound('Deal not found');
  }

  deal.stage = stage;
  deal.updatedAt = new Date().toISOString();
  writeJSON(PIPELINE_FILE, pipeline);

  ApiResponse.success(res, deal, 'Deal stage updated successfully');
};

/**
 * POST /api/pipeline/deals
 * Create a new deal.
 */
const createDeal = (req, res) => {
  const { title, value, stage } = req.body;

  if (!title) {
    throw ApiError.badRequest('Deal title is required', [
      { field: 'title', message: 'Title is required' },
    ]);
  }

  const pipeline = readJSON(PIPELINE_FILE);
  const newDeal = {
    id: `deal_${Date.now()}`,
    title,
    value: value || 0,
    stage: stage || pipeline.stages?.[0]?.id || 'new',
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  pipeline.deals.push(newDeal);
  writeJSON(PIPELINE_FILE, pipeline);

  ApiResponse.created(res, 'Deal created successfully');
};

/**
 * PUT /api/pipeline/deals/:id
 * Update a deal's details.
 */
const updateDeal = (req, res) => {
  const pipeline = readJSON(PIPELINE_FILE);
  const idx = pipeline.deals.findIndex((d) => d.id === req.params.id);

  if (idx === -1) {
    throw ApiError.notFound('Deal not found');
  }

  pipeline.deals[idx] = {
    ...pipeline.deals[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  writeJSON(PIPELINE_FILE, pipeline);

  ApiResponse.success(res, pipeline.deals[idx], 'Deal updated successfully');
};

export {
  getAll,
  getStages,
  getDeals,
  updateDealStage,
  createDeal,
  updateDeal,
};
