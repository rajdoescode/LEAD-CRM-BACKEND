import Notification from '../models/Notification.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

const getAll = async (req, res) => {
  const { page = 1, limit = 25 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 25), 100);

  const filter = req.user ? { user: req.user._id } : {};

  const [notifs, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
    Notification.countDocuments(filter),
  ]);

  const transformed = notifs.map((n) => { n.id = n._id; delete n._id; delete n.__v; return n; });
  const totalPages = Math.ceil(total / limitNum);

  ApiResponse.paginated(res, transformed, { page: pageNum, limit: limitNum, total, totalPages, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1 }, 'Notifications fetched');
};

const markRead = async (req, res) => {
  const notif = await Notification.findByIdAndUpdate(req.params.id, { read: true, readAt: new Date() }, { new: true });
  if (!notif) throw ApiError.notFound('Notification not found');
  ApiResponse.success(res, notif, 'Notification marked as read');
};

const markAllRead = async (req, res) => {
  const filter = req.user ? { user: req.user._id, read: false } : { read: false };
  const result = await Notification.updateMany(filter, { read: true, readAt: new Date() });
  ApiResponse.success(res, { updatedCount: result.modifiedCount }, 'All notifications marked as read');
};

export { getAll, markRead, markAllRead };
