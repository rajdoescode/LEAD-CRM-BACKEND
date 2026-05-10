import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead reference is required'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Follow-up date is required'],
    },
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'visit', 'other'],
      default: 'call',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'overdue'],
      default: 'pending',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    completedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
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
followUpSchema.index({ lead: 1, scheduledAt: 1 });
followUpSchema.index({ assignedTo: 1, scheduledAt: 1 });
followUpSchema.index({ status: 1, scheduledAt: 1 });
followUpSchema.index({ priority: 1 });

const FollowUp = mongoose.model('FollowUp', followUpSchema);
export default FollowUp;
