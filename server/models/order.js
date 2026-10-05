import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    buyerId: {
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
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      index: true,
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['CREATED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'CREATED',
      index: true,
    },
    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
      index: true,
    },
    razorpaySignature: {
      type: String,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

OrderSchema.index({ buyerId: 1, promptId: 1, status: 1 });
OrderSchema.index({ sellerId: 1, createdAt: -1 });

const Order = mongoose.model('Order', OrderSchema);
export default Order;
