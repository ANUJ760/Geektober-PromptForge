import mongoose from 'mongoose';
import Prompt from '../models/prompt.js';
import Users from '../models/user.js';
import Order from '../models/order.js';
import Entitlement from '../models/entitlement.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../config/razorpay.js';

export async function createOrder(req, res) {
  try {
    const buyerId = req.user.id;
    const { promptId } = req.body;

    if (!promptId) {
      return res.status(400).json({ success: false, message: 'Prompt ID is required' });
    }

    const prompt = await Prompt.findById(promptId);
    if (!prompt) {
      return res.status(404).json({ success: false, message: 'Prompt not found' });
    }

    // Prevent creator buying own prompt
    if (prompt.authorId && prompt.authorId.toString() === buyerId) {
      return res.status(400).json({ success: false, message: 'You are the creator of this prompt' });
    }

    // Check existing entitlement
    const existingEntitlement = await Entitlement.findOne({ userId: buyerId, promptId: prompt._id });
    if (existingEntitlement) {
      return res.status(400).json({
        success: false,
        message: 'You already own this prompt',
        alreadyOwned: true,
      });
    }

    // Free prompts do not require payment
    if (prompt.pricePaise === 0) {
      const freeOrder = await Order.create({
        buyerId,
        promptId: prompt._id,
        sellerId: prompt.authorId,
        amountPaise: 0,
        currency: 'INR',
        status: 'PAID',
        paidAt: new Date(),
      });

      await Entitlement.create({
        userId: buyerId,
        promptId: prompt._id,
        orderId: freeOrder._id,
      });

      await Prompt.findByIdAndUpdate(prompt._id, { $inc: { salesCount: 1 } });

      return res.status(200).json({
        success: true,
        isFree: true,
        message: 'Free prompt unlocked successfully!',
        fullPromptText: prompt.fullPromptText,
        negativePrompt: prompt.negativePrompt,
        seed: prompt.seed,
      });
    }

    // Check for recent pending order to ensure idempotency
    const idempotencyKey = `${buyerId}_${promptId}_${prompt.pricePaise}`;
    let order = await Order.findOne({
      buyerId,
      promptId: prompt._id,
      status: 'PENDING',
      createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
    });

    if (!order) {
      const rzpOrder = await createRazorpayOrder({
        amountPaise: prompt.pricePaise,
        currency: 'INR',
        receipt: `rcpt_${buyerId.slice(-6)}_${Date.now().toString().slice(-6)}`,
      });

      order = await Order.create({
        buyerId,
        promptId: prompt._id,
        sellerId: prompt.authorId,
        amountPaise: prompt.pricePaise,
        currency: 'INR',
        status: 'PENDING',
        razorpayOrderId: rzpOrder.id,
        idempotencyKey,
      });
    }

    return res.status(200).json({
      success: true,
      orderId: order._id.toString(),
      razorpayOrderId: order.razorpayOrderId,
      amount: order.amountPaise,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_simKey',
      prompt: {
        title: prompt.title,
        category: prompt.category,
        aiModel: prompt.aiModel,
      },
    });
  } catch (err) {
    console.error('Order creation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create order', error: err.message });
  }
}

export async function verifyPayment(req, res) {
  try {
    const buyerId = req.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification tokens' });
    }

    // Verify signature
    const isValid = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'FAILED' }
      );
      return res.status(400).json({ success: false, message: 'Cryptographic signature verification failed' });
    }

    // Retrieve order
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Associated order not found' });
    }

    const prompt = await Prompt.findById(order.promptId);
    if (!prompt) {
      return res.status(404).json({ success: false, message: 'Prompt not found' });
    }

    // Idempotency: If already fulfilled, return success immediately
    if (order.status === 'PAID') {
      return res.status(200).json({
        success: true,
        message: 'Order already fulfilled',
        fullPromptText: prompt.fullPromptText,
        negativePrompt: prompt.negativePrompt,
        seed: prompt.seed,
      });
    }

    // Atomic fulfillment
    order.status = 'PAID';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paidAt = new Date();
    await order.save();

    // Create Entitlement record
    await Entitlement.findOneAndUpdate(
      { userId: buyerId, promptId: prompt._id },
      { orderId: order._id, grantedAt: new Date() },
      { upsert: true, new: true }
    );

    // Increment sales count
    await Prompt.findByIdAndUpdate(prompt._id, { $inc: { salesCount: 1 } });

    // Credit creator's balance (90% net earnings after 10% platform fee)
    if (order.sellerId && order.amountPaise > 0) {
      const netCreatorPaise = Math.round(order.amountPaise * 0.9);
      await Users.findByIdAndUpdate(order.sellerId, {
        $inc: { creatorBalancePaise: netCreatorPaise },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and prompt unlocked!',
      fullPromptText: prompt.fullPromptText,
      negativePrompt: prompt.negativePrompt,
      seed: prompt.seed,
      order: {
        id: order._id.toString(),
        amount: order.amountPaise,
        paidAt: order.paidAt,
      },
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    return res.status(500).json({ success: false, message: 'Error processing payment verification', error: err.message });
  }
}

export async function getUserOrders(req, res) {
  try {
    const buyerId = req.user.id;
    const orders = await Order.find({ buyerId, status: 'PAID' })
      .populate('promptId', 'title category aiModel imageUrl pricePaise author')
      .sort({ paidAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user orders', error: err.message });
  }
}
