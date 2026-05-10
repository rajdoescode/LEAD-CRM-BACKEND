import { readJSON, writeJSON } from '../utils/fileHelper.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import paginate from '../utils/paginate.js';

const TASKS_FILE = 'tasks.json';

/**
 * GET /api/tasks
 * Fetch tasks with optional filters and pagination.
 */
const getAll = (req, res) => {
  const { status, assignee, priority } = req.query;
  let tasks = readJSON(TASKS_FILE);

  // ─── Filters ────────────────────────────────────────────────
  if (status) tasks = tasks.filter((t) => t.status === status);
  if (assignee) tasks = tasks.filter((t) => t.assignee === assignee);
  if (priority) tasks = tasks.filter((t) => t.priority === priority);

  // ─── Sort by due date ───────────────────────────────────────
  tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // ─── Paginate ───────────────────────────────────────────────
  const { items, pagination } = paginate(tasks, req.query);

  ApiResponse.paginated(res, items, pagination, 'Tasks fetched successfully');
};

/**
 * POST /api/tasks
 * Create a new task.
 */
const create = (req, res) => {
  const { title } = req.body;

  if (!title) {
    throw ApiError.badRequest('Task title is required', [
      { field: 'title', message: 'Title is required' },
    ]);
  }

  const tasks = readJSON(TASKS_FILE);
  const newTask = {
    id: `task_${Date.now()}`,
    ...req.body,
    status: req.body.status || 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  writeJSON(TASKS_FILE, tasks);

  ApiResponse.created(res, 'Task created successfully');
};

/**
 * PUT /api/tasks/:id
 * Update an existing task.
 */
const update = (req, res) => {
  const tasks = readJSON(TASKS_FILE);
  const idx = tasks.findIndex((t) => t.id === req.params.id);

  if (idx === -1) {
    throw ApiError.notFound('Task not found');
  }

  tasks[idx] = { ...tasks[idx], ...req.body, updatedAt: new Date().toISOString() };
  writeJSON(TASKS_FILE, tasks);

  ApiResponse.success(res, tasks[idx], 'Task updated successfully');
};

/**
 * DELETE /api/tasks/:id
 * Delete a task.
 */
const remove = (req, res) => {
  const tasks = readJSON(TASKS_FILE);
  const idx = tasks.findIndex((t) => t.id === req.params.id);

  if (idx === -1) {
    throw ApiError.notFound('Task not found');
  }

  tasks.splice(idx, 1);
  writeJSON(TASKS_FILE, tasks);

  ApiResponse.noContent(res, 'Task deleted successfully');
};

export {
  getAll,
  create,
  update,
  remove
};
