import { readJSON, writeJSON } from '../utils/fileHelper.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import paginate from '../utils/paginate.js';

const NOTIF_FILE = 'notifications.json';

/**
 * GET /api/notifications
 * Fetch all notifications, sorted newest-first, with pagination.
 */
const getAll = (req, res) => {
  const notifs = readJSON(NOTIF_FILE).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const { items, pagination } = paginate(notifs, req.query);
  ApiResponse.paginated(res, items, pagination, 'Notifications fetched successfully');
};

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read.
 */
const markRead = (req, res) => {
  const notifs = readJSON(NOTIF_FILE);
  const notif = notifs.find((n) => n.id === req.params.id);

  if (!notif) {
    throw ApiError.notFound('Notification not found');
  }

  notif.read = true;
  notif.readAt = new Date().toISOString();
  writeJSON(NOTIF_FILE, notifs);

  ApiResponse.success(res, notif, 'Notification marked as read');
};

/**
 * PUT /api/notifications/mark-all-read
 * Mark all notifications as read.
 */
const markAllRead = (_req, res) => {
  const notifs = readJSON(NOTIF_FILE);
  const now = new Date().toISOString();

  notifs.forEach((n) => {
    n.read = true;
    n.readAt = now;
  });

  writeJSON(NOTIF_FILE, notifs);

  ApiResponse.success(res, { updatedCount: notifs.length }, 'All notifications marked as read');
};

export {
  getAll,
  markRead,
  markAllRead
};
