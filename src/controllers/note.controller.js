import Note from '../models/Note.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { logActivity } from '../services/activityService.js';

const getByLeadId = async (req, res) => {
  const { leadId } = req.params;
  const notes = await Note.find({ lead: leadId }).populate('author', 'name email avatar').sort({ isPinned: -1, createdAt: -1 }).lean();
  const transformed = notes.map((n) => { n.id = n._id; delete n._id; delete n.__v; return n; });
  ApiResponse.success(res, transformed, 'Notes fetched');
};

const create = async (req, res) => {
  const { leadId } = req.params;
  const note = await Note.create({ ...req.body, lead: leadId, author: req.user?._id });
  await logActivity({ type: 'note_added', description: `Note added to lead`, lead: leadId, user: req.user?._id });
  ApiResponse.created(res, note, 'Note created');
};

const update = async (req, res) => {
  const note = await Note.findByIdAndUpdate(req.params.noteId, req.body, { new: true, runValidators: true }).populate('author', 'name email avatar');
  if (!note) throw ApiError.notFound('Note not found');
  ApiResponse.success(res, note, 'Note updated');
};

const remove = async (req, res) => {
  const note = await Note.findByIdAndDelete(req.params.noteId);
  if (!note) throw ApiError.notFound('Note not found');
  ApiResponse.noContent(res, 'Note deleted');
};

export { getByLeadId, create, update, remove };
