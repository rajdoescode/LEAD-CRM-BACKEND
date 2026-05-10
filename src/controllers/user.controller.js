import User from '../models/User.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

const getAll = async (req, res) => {
  const { page = 1, limit = 25 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 25), 100);

  const [users, total] = await Promise.all([
    User.find({ isActive: true }).select('-pin').sort({ name: 1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
    User.countDocuments({ isActive: true }),
  ]);

  const transformed = users.map((u) => { u.id = u._id; delete u._id; delete u.__v; return u; });
  const totalPages = Math.ceil(total / limitNum);

  ApiResponse.paginated(res, transformed, { page: pageNum, limit: limitNum, total, totalPages, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1 }, 'Users fetched');
};

const getById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-pin');
  if (!user) throw ApiError.notFound('User not found');
  ApiResponse.success(res, user, 'User fetched');
};

const create = async (req, res) => {
  const user = await User.create(req.body);
  ApiResponse.created(res, user, 'User created');
};

const update = async (req, res) => {
  const { pin, ...updateData } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-pin');
  if (!user) throw ApiError.notFound('User not found');
  ApiResponse.success(res, user, 'User updated');
};

const remove = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-pin');
  if (!user) throw ApiError.notFound('User not found');
  ApiResponse.noContent(res, 'User deactivated');
};

export { getAll, getById, create, update, remove };
