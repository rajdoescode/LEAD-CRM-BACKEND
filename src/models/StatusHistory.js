import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead reference is required'],
    },
    fromStatus: {
      type: String,
      trim: true,
      default: '',
    },
    toStatus: {
      type: String,
      trim: true,
      default: '',
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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
statusHistorySchema.index({ lead: 1, createdAt: -1 });
statusHistorySchema.index({ changedBy: 1 });
statusHistorySchema.index({ toStatus: 1 });
statusHistorySchema.index({ createdAt: -1 });

const StatusHistory = mongoose.model('StatusHistory', statusHistorySchema);
export default StatusHistory;
