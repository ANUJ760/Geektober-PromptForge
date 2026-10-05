import crypto from 'crypto';
import Order from '../models/order.js';
import Prompt from '../models/prompt.js';
import Entitlement from '../models/entitlement.js';
import Users from '../models/user.js';

export async function handleRazorpayWebhook(req, res) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature if secret configured
    if (webhookSecret && signature) {
      const rawBody = req.rawBody ? req.rawBody.toString('utf-8') : JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.warn('Webhook signature mismatch detected');
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (!payload) {
      return res.status(200).json({ status: 'ok', message: 'No payload in webhook' });
    }

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id || payload.order?.entity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const order = await Order.findOne({ razorpayOrderId });

        if (order) {
          // Idempotency check: if already PAID, do nothing
          if (order.status === 'PAID') {
            return res.status(200).json({ status: 'already_processed' });
          }

          order.status = 'PAID';
          order.razorpayPaymentId = razorpayPaymentId || order.razorpayPaymentId;
          order.paidAt = new Date();
          await order.save();

          // Ensure entitlement is provisioned
          await Entitlement.findOneAndUpdate(
            { userId: order.buyerId, promptId: order.promptId },
            { orderId: order._id, grantedAt: new Date() },
            { upsert: true, new: true }
          );

          await Prompt.findByIdAndUpdate(order.promptId, { $inc: { salesCount: 1 } });

          if (order.sellerId && order.amountPaise > 0) {
            const netCreatorPaise = Math.round(order.amountPaise * 0.9);
            await Users.findByIdAndUpdate(order.sellerId, {
              $inc: { creatorBalancePaise: netCreatorPaise },
            });
          }
        }
      }
    } else if (event === 'payment.failed') {
      const razorpayOrderId = payload.payment?.entity?.order_id;
      if (razorpayOrderId) {
        await Order.findOneAndUpdate(
          { razorpayOrderId, status: 'PENDING' },
          { status: 'FAILED' }
        );
      }
    }

    return res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ success: false, message: 'Webhook error', error: err.message });
  }
}
