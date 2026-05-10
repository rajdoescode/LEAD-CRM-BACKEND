import { readJSON } from '../utils/fileHelper.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import paginate from '../utils/paginate.js';

const USERS_FILE = 'users.json';

/**
 * GET /api/users
 * Fetch all users (with PIN stripped). Supports pagination.
 */
const getAll = (req, res) => {
  const users = readJSON(USERS_FILE).map(({ pin, ...u }) => u);
  const { items, pagination } = paginate(users, req.query);

  ApiResponse.paginated(res, items, pagination, 'Users fetched successfully');
};

/**
 * GET /api/users/:id
 * Fetch a single user by ID.
 */
const getById = (req, res) => {
  const user = readJSON(USERS_FILE).find((u) => u.id === req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const { pin, ...safeUser } = user;
  ApiResponse.success(res, safeUser, 'User fetched successfully');
};

export {
  getAll,
  getById
};
