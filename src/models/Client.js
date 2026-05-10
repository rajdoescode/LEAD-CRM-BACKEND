import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    designation: {
      type: String,
      trim: true,
      default: '',
    },
    /** Reference back to the original lead that was converted. */
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
    },
    /** Agent/user who manages this client. */
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'churned'],
      default: 'active',
    },
    category: {
      type: String,
      enum: ['individual', 'business', 'enterprise', 'government'],
      default: 'individual',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    /** Total revenue generated from this client. */
    totalRevenue: {
      type: Number,
      min: 0,
      default: 0,
    },
    /** Total number of deals closed with this client. */
    totalDeals: {
      type: Number,
      min: 0,
      default: 0,
    },
    /** Date when the lead was converted to a client. */
    convertedAt: {
      type: Date,
      default: Date.now,
    },
    lastInteractionAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    tags: [{
      type: String,
      trim: true,
    }],
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
clientSchema.index({ email: 1 });
clientSchema.index({ assignedTo: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ category: 1 });
clientSchema.index({ lead: 1 });
clientSchema.index({ convertedAt: -1 });
clientSchema.index({ name: 'text', email: 'text', company: 'text' });

const Client = mongoose.model('Client', clientSchema);
export default Client;
