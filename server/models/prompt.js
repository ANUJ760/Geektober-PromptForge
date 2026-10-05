import mongoose from 'mongoose';

const PromptSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    author: { type: String, default: 'Anonymous' },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    category: { type: String, required: true },
    aiModel: {
      type: String,
      default: 'Midjourney v6',
    },
    imageUrl: { type: String, required: true },
    fullPromptText: { type: String, required: true },
    previewPromptText: { type: String, required: true },
    promptText: { type: String },
    negativePrompt: { type: String, default: '' },
    seed: { type: String, default: '' },
    pricePaise: { type: Number, default: 0, min: 0 },
    likes: { type: Number, default: 0, min: 0 },
    salesCount: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Pre-save hook to populate promptText and previewPromptText if omitted
PromptSchema.pre('validate', function () {
  if (!this.promptText && this.fullPromptText) {
    this.promptText = this.fullPromptText;
  }
  if (!this.fullPromptText && this.promptText) {
    this.fullPromptText = this.promptText;
  }
  if (!this.previewPromptText) {
    if (this.pricePaise === 0) {
      this.previewPromptText = this.fullPromptText;
    } else {
      const sliceLength = Math.min(50, Math.floor((this.fullPromptText || '').length * 0.35));
      this.previewPromptText = `${(this.fullPromptText || '').slice(0, sliceLength)}... [LOCKED - Purchase to unlock complete prompt, model parameters, and seed]`;
    }
  }
});

PromptSchema.index({ category: 1, aiModel: 1, pricePaise: 1, createdAt: -1 });
PromptSchema.index({ authorId: 1, createdAt: -1 });
PromptSchema.index({ likes: -1 });
PromptSchema.index({ salesCount: -1 });
PromptSchema.index({ title: 'text', description: 'text', previewPromptText: 'text' });

const Prompt = mongoose.model('Prompt', PromptSchema);

export default Prompt;