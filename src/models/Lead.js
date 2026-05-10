import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },

    source: {
      type: String,
      enum: ['Website', 'Referral', 'LinkedIn', 'Cold Email', 'Conference', 'Trade Show', 'Partner', 'Other'],
      default: 'Website',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'interested', 'qualified', 'proposal', 'negotiation', 'follow-up', 'won', 'lost'],
      default: 'new',
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    tags: [{
      type: String,
      trim: true,
    }],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    lastContactedAt: {
      type: Date,
    },
    nextFollowUpAt: {
      type: Date,
    },
    convertedAt: {
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
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ score: -1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ name: 'text', email: 'text' });

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
