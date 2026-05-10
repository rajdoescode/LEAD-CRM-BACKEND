import Task from '../models/Task.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { logActivity } from '../services/activityService.js';

/**
 * GET /api/tasks
 * Fetch tasks with optional filters and pagination.
 */
const getAll = async (req, res) => {
  const { status, assignee, priority, page = 1, limit = 25 } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 25), 100);

  const filter = {};
  if (status) filter.status = status;
  if (assignee) filter.assignee = assignee;
  if (priority) filter.priority = priority;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('lead', 'name email phone')
      .sort({ dueDate: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Task.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  // Transform _id to id
  const transformed = tasks.map((t) => {
    t.id = t._id;
    delete t._id;
    delete t.__v;
    return t;
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
    'Tasks fetched successfully'
  );
};

/**
 * POST /api/tasks
 * Create a new task.
 */
const create = async (req, res) => {
  const task = await Task.create({
    ...req.body,
    assignee: req.body.assignee || req.user?._id,
  });

  await logActivity({
    type: 'task_created',
    description: `Task "${task.title}" created`,
    lead: task.lead,
    user: req.user?._id,
  });

  ApiResponse.created(res, task, 'Task created successfully');
};

/**
 * PUT /api/tasks/:id
 * Update an existing task.
 */
const update = async (req, res) => {
  // If completing the task, set completedAt
  if (req.body.status === 'completed' && !req.body.completedAt) {
    req.body.completedAt = new Date();
  }

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true, runValidators: true }
  )
    .populate('assignee', 'name email avatar')
    .populate('lead', 'name email phone');

  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  if (req.body.status === 'completed') {
    await logActivity({
      type: 'task_completed',
      description: `Task "${task.title}" completed`,
      lead: task.lead?._id,
      user: req.user?._id,
    });
  }

  ApiResponse.success(res, task, 'Task updated successfully');
};

/**
 * DELETE /api/tasks/:id
 * Delete a task.
 */
const remove = async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  ApiResponse.noContent(res, 'Task deleted successfully');
};

export {
  getAll,
  create,
  update,
  remove,
};
