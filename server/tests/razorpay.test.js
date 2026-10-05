import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
} from '../config/razorpay.js';

describe('Razorpay Cryptographic Payment Verification Suite', () => {
  it('should generate simulated order when API keys are not configured', async () => {
    const order = await createRazorpayOrder({
      amountPaise: 49900,
      currency: 'INR',
      receipt: 'rcpt_test_123',
    });

    expect(order).toBeDefined();
    expect(order.id).toBeDefined();
    expect(order.amount).toBe(49900);
    expect(order.currency).toBe('INR');
  });

  it('should verify valid HMAC-SHA256 signature generated with test secret', () => {
    const testSecret = 'mock_secret_key';
    const orderId = 'order_sim_99887766';
    const paymentId = 'pay_sim_11223344';

    const validSignature = crypto
      .createHmac('sha256', testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isValid = verifyRazorpaySignature({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
    });

    expect(isValid).toBe(true);
  });

  it('should reject tampered or mismatched payment signatures', () => {
    const orderId = 'order_sim_99887766';
    const paymentId = 'pay_sim_11223344';
    const forgedSignature = 'tampered_invalid_hex_string_signature';

    const isValid = verifyRazorpaySignature({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: forgedSignature,
    });

    expect(isValid).toBe(false);
  });

  it('should reject empty or missing signature parameters', () => {
    expect(verifyRazorpaySignature({})).toBe(false);
    expect(
      verifyRazorpaySignature({
        razorpay_order_id: 'order_123',
        razorpay_payment_id: '',
        razorpay_signature: 'sig',
      })
    ).toBe(false);
  });
});
