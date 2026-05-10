import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['lead_created', 'lead_updated', 'lead_converted', 'lead_lost',
             'call_logged', 'note_added', 'follow_up_scheduled', 'follow_up_completed',
             'task_created', 'task_completed', 'deal_created', 'deal_stage_changed',
             'deal_won', 'deal_lost', 'user_login'],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
activitySchema.index({ createdAt: -1 });
activitySchema.index({ lead: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ type: 1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
