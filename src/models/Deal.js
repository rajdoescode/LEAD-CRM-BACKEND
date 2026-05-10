import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Deal title is required'],
      trim: true,
    },
    value: {
      type: Number,
      min: 0,
      default: 0,
    },
    stage: {
      type: String,
      enum: ['new', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
      default: 'new',
    },
    probability: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    expectedCloseDate: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    contact: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
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
dealSchema.index({ stage: 1 });
dealSchema.index({ assignedTo: 1, stage: 1 });
dealSchema.index({ lead: 1 });
dealSchema.index({ value: -1 });
dealSchema.index({ expectedCloseDate: 1 });

const Deal = mongoose.model('Deal', dealSchema);
export default Deal;
