import mongoose from 'mongoose';

const callLogSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead reference is required'],
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    callDate: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: Number,
      min: 0,
      default: 0,
      comment: 'Duration in seconds',
    },
    callType: {
      type: String,
      enum: ['inbound', 'outbound', 'missed', 'voicemail'],
      default: 'outbound',
    },
    status: {
      type: String,
      enum: ['completed', 'no-answer', 'busy', 'failed', 'scheduled'],
      default: 'completed',
    },
    outcome: {
      type: String,
      enum: ['interested', 'not-interested', 'callback', 'voicemail', 'converted', 'follow-up', 'no-response'],
      default: 'interested',
    },
    remarks: {
      type: String,
      required: [true, 'Call remarks are required'],
      trim: true,
    },
    discussionSummary: {
      type: String,
      trim: true,
      default: '',
    },
    followUpDate: {
      type: Date,
    },
    followUpNotes: {
      type: String,
      trim: true,
      default: '',
    },
    policyType: {
      type: String,
      trim: true,
      default: '',
    },
    policyNumber: {
      type: String,
      trim: true,
      default: '',
    },
    premium: {
      type: Number,
      min: 0,
      default: 0,
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
callLogSchema.index({ lead: 1, callDate: -1 });
callLogSchema.index({ agent: 1, callDate: -1 });
callLogSchema.index({ outcome: 1 });
callLogSchema.index({ followUpDate: 1 });

const CallLog = mongoose.model('CallLog', callLogSchema);
export default CallLog;
