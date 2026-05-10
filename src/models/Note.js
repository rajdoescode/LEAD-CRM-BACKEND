import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead reference is required'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['general', 'meeting', 'call', 'email', 'reminder'],
      default: 'general',
    },
    isPinned: {
      type: Boolean,
      default: false,
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
noteSchema.index({ lead: 1, createdAt: -1 });
noteSchema.index({ author: 1 });
noteSchema.index({ isPinned: -1, createdAt: -1 });

const Note = mongoose.model('Note', noteSchema);
export default Note;
