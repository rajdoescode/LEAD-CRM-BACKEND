import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    pin: {
      type: String,
      required: [true, 'PIN is required'],
      minlength: [4, 'PIN must be 4 digits'],
      maxlength: [100, 'PIN hash can be up to 100 chars'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'agent'],
      default: 'agent',
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
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
        delete ret.pin;
      },
    },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────
// email unique constraint is already handled by the schema definition above
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// ─── Methods ─────────────────────────────────────────────────────
userSchema.methods.comparePin = async function (candidatePin) {
  return bcrypt.compare(candidatePin, this.pin);
};

// ─── Pre-save hook: hash PIN ─────────────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('pin')) return;
  const salt = await bcrypt.genSalt(10);
  this.pin = await bcrypt.hash(this.pin, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
