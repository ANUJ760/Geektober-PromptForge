import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import app from '../server.js';

describe('Razorpay Webhook Ingress & Cryptographic Hardening Suite', () => {
  const testSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret_key_123';

  beforeAll(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;
  });

  it('should reject webhook requests missing x-razorpay-signature header with 400', async () => {
    const payload = {
      event: 'payment.captured',
      payload: {
        payment: { entity: { id: 'pay_test_001', order_id: 'order_test_001' } },
      },
    };

    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Missing x-razorpay-signature');
  });

  it('should reject webhook requests with tampered or forged signatures with 400', async () => {
    const payload = {
      event: 'payment.captured',
      payload: {
        payment: { entity: { id: 'pay_test_002', order_id: 'order_test_002' } },
      },
    };

    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('x-razorpay-signature', '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid webhook signature');
  });

  it('should accept valid HMAC-SHA256 signed webhook payload with 200 OK', async () => {
    const payload = {
      event: 'payment.captured',
      payload: {
        payment: { entity: { id: 'pay_nonexistent_001', order_id: 'order_nonexistent_001' } },
      },
    };

    const rawBody = JSON.stringify(payload);
    const validSignature = crypto
      .createHmac('sha256', testSecret)
      .update(rawBody)
      .digest('hex');

    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', validSignature)
      .send(rawBody);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('should process payment.failed events gracefully with 200 OK', async () => {
    const payload = {
      event: 'payment.failed',
      payload: {
        payment: { entity: { id: 'pay_failed_001', order_id: 'order_failed_001' } },
      },
    };

    const rawBody = JSON.stringify(payload);
    const validSignature = crypto
      .createHmac('sha256', testSecret)
      .update(rawBody)
      .digest('hex');

    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', validSignature)
      .send(rawBody);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });
});
