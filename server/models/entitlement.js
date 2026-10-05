import mongoose from 'mongoose';

const EntitlementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
      index: true,
    },
    promptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prompt',
      required: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    grantedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound unique index enforces single entitlement per user and prompt
EntitlementSchema.index({ userId: 1, promptId: 1 }, { unique: true });

const Entitlement = mongoose.model('Entitlement', EntitlementSchema);
export default Entitlement;
