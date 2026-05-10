import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
    },
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'follow-up', 'review', 'other'],
      default: 'other',
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ assignee: 1, status: 1 });
taskSchema.index({ lead: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });

const Task = mongoose.model('Task', taskSchema);
export default Task;
