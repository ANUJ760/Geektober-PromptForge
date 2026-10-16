import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import crypto from 'crypto';
import app from '../server.js';
import eventBus, { broadcastToUser } from '../utils/eventBus.js';
import {
  getConnectedClientsCount,
  resetClientRegistry,
  formatSSE,
} from '../controllers/notificationController.js';

describe('Server-Sent Events (SSE) Real-Time Notification Pipeline', () => {
  let server;
  let port;
  const JWT_SECRET = process.env.JWT_Secret_Key || 'default_jwt_secret_dev_key_promptforge';

  function createTestUser() {
    const id = crypto.randomBytes(12).toString('hex');
    const token = jwt.sign(
      { id, email: `user_${id}@promptforge.dev`, username: `user_${id}` },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    return { id, token };
  }

  beforeAll(async () => {
    resetClientRegistry();
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    resetClientRegistry();
    if (server) {
      if (typeof server.closeAllConnections === 'function') {
        server.closeAllConnections();
      }
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('should reject unauthenticated SSE connection with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/v1/notifications/stream');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject invalid token with 401 Unauthorized', async () => {
    const res = await request(app)
      .get('/api/v1/notifications/stream')
      .set('Cookie', ['token=invalid_jwt_token_payload']);
    expect(res.status).toBe(401);
  });

  it('should establish persistent SSE stream with valid headers and initial connected event', async () => {
    const user = createTestUser();

    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: '/api/v1/notifications/stream',
          method: 'GET',
          headers: {
            Cookie: `token=${user.token}`,
          },
        },
        (res) => {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toBe('text/event-stream');
          expect(res.headers['cache-control']).toBe('no-cache, no-transform');
          expect(res.headers['connection']).toBe('keep-alive');
          expect(res.headers['x-accel-buffering']).toBe('no');

          res.on('data', (chunk) => {
            const text = chunk.toString();
            if (text.includes('event: connected')) {
              expect(text).toContain(user.id);
              expect(getConnectedClientsCount(user.id)).toBe(1);
              req.destroy();
              resolve();
            }
          });
        }
      );

      req.on('error', (err) => {
        if (err.code !== 'ECONNRESET') reject(err);
      });
      req.end();
    });
  });

  it('should broadcast PAYMENT_SUCCESS event via eventBus to target user stream', async () => {
    const user = createTestUser();
    const paymentPayload = {
      event: 'PAYMENT_SUCCESS',
      data: {
        orderId: 'order_test_999',
        promptId: 'prompt_cyberpunk_123',
        title: 'Cyberpunk Neon Portraits',
        message: 'Payment verified! Full prompt and parameters are now unlocked.',
      },
    };

    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: '/api/v1/notifications/stream',
          method: 'GET',
          headers: {
            Cookie: `token=${user.token}`,
          },
        },
        (res) => {
          res.on('data', (chunk) => {
            const text = chunk.toString();
            if (text.includes('event: connected')) {
              setTimeout(() => {
                broadcastToUser(user.id, paymentPayload);
              }, 50);
            } else if (text.includes('PAYMENT_SUCCESS')) {
              expect(text).toContain('prompt_cyberpunk_123');
              expect(text).toContain('Cyberpunk Neon Portraits');
              expect(text).toContain('Payment verified');
              req.destroy();
              resolve();
            }
          });
        }
      );

      req.on('error', (err) => {
        if (err.code !== 'ECONNRESET') reject(err);
      });
      req.end();
    });
  });

  it('should not leak events to other users', async () => {
    const user1 = createTestUser();
    const user2 = createTestUser();

    return new Promise((resolve, reject) => {
      let user2ReceivedUnexpectedEvent = false;

      const req2 = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: '/api/v1/notifications/stream',
          method: 'GET',
          headers: {
            Cookie: `token=${user2.token}`,
          },
        },
        (res2) => {
          res2.on('data', (chunk) => {
            const text = chunk.toString();
            if (text.includes('user1_private_event')) {
              user2ReceivedUnexpectedEvent = true;
            }
          });

          setTimeout(() => {
            broadcastToUser(user1.id, {
              event: 'user1_private_event',
              data: { secret: 'user1_only' },
            });

            setTimeout(() => {
              expect(user2ReceivedUnexpectedEvent).toBe(false);
              req2.destroy();
              resolve();
            }, 100);
          }, 50);
        }
      );

      req2.on('error', (err) => {
        if (err.code !== 'ECONNRESET') reject(err);
      });
      req2.end();
    });
  });

  it('should support multiple concurrent tabs for the same user', async () => {
    const user = createTestUser();

    return new Promise((resolve) => {
      let tab1GotEvent = false;
      let tab2GotEvent = false;

      function checkDone() {
        if (tab1GotEvent && tab2GotEvent) {
          req1.destroy();
          req2.destroy();
          resolve();
        }
      }

      const req1 = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: '/api/v1/notifications/stream',
          method: 'GET',
          headers: { Cookie: `token=${user.token}` },
        },
        (res1) => {
          res1.on('data', (chunk) => {
            if (chunk.toString().includes('MULTI_TAB_TEST')) {
              tab1GotEvent = true;
              checkDone();
            }
          });
        }
      );

      const req2 = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: '/api/v1/notifications/stream',
          method: 'GET',
          headers: { Cookie: `token=${user.token}` },
        },
        (res2) => {
          res2.on('data', (chunk) => {
            if (chunk.toString().includes('MULTI_TAB_TEST')) {
              tab2GotEvent = true;
              checkDone();
            }
          });
        }
      );

      req1.on('error', () => {});
      req2.on('error', () => {});

      req1.end();
      req2.end();

      setTimeout(() => {
        expect(getConnectedClientsCount(user.id)).toBe(2);
        broadcastToUser(user.id, {
          event: 'MULTI_TAB_TEST',
          data: { success: true },
        });
      }, 100);
    });
  });

  it('should clean up client registry on disconnect to prevent memory leaks', async () => {
    const user = createTestUser();

    return new Promise((resolve) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: '/api/v1/notifications/stream',
          method: 'GET',
          headers: { Cookie: `token=${user.token}` },
        },
        (res) => {
          res.on('data', (chunk) => {
            if (chunk.toString().includes('connected')) {
              expect(getConnectedClientsCount(user.id)).toBe(1);
              // Destroy client connection
              req.destroy();

              setTimeout(() => {
                expect(getConnectedClientsCount(user.id)).toBe(0);
                resolve();
              }, 100);
            }
          });
        }
      );

      req.on('error', () => {});
      req.end();
    });
  });

  it('formatSSE should correctly format SSE event frames', () => {
    const formatted = formatSSE('TEST_EVENT', { id: 123, status: 'ok' });
    expect(formatted).toBe('event: TEST_EVENT\ndata: {"id":123,"status":"ok"}\n\n');

    const defaultFormat = formatSSE(null, { ping: true });
    expect(defaultFormat).toBe('data: {"ping":true}\n\n');
  });

  it('should deliver PAYMENT_SUCCESS via SSE when a Razorpay webhook payment is captured', async () => {
    const user = createTestUser();
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret_key_123';
    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

    // Create prompt and pending order in DB
    const Prompt = (await import('../models/prompt.js')).default;
    const Order = (await import('../models/order.js')).default;

    const testPrompt = await Prompt.create({
      title: 'Neon Cyberpunk Samurai',
      category: 'Cyberpunk',
      description: 'Futuristic warrior',
      promptText: 'Neon warrior cyberpunk',
      fullPromptText: 'Full unmasked prompt text for samurai',
      pricePaise: 49900,
      imageUrl: 'https://images.unsplash.com/photo-test',
      isPublished: true,
    });

    const razorpayOrderId = `order_e2e_${Date.now()}`;
    const order = await Order.create({
      buyerId: user.id,
      promptId: testPrompt._id,
      amountPaise: 49900,
      currency: 'INR',
      status: 'PENDING',
      razorpayOrderId,
    });

    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: '/api/v1/notifications/stream',
          method: 'GET',
          headers: { Cookie: `token=${user.token}` },
        },
        (res) => {
          res.on('data', async (chunk) => {
            const text = chunk.toString();
            if (text.includes('event: connected')) {
              // Trigger webhook payload
              const webhookPayload = {
                event: 'payment.captured',
                payload: {
                  payment: {
                    entity: {
                      id: `pay_${Date.now()}`,
                      order_id: razorpayOrderId,
                    },
                  },
                },
              };

              const rawBody = JSON.stringify(webhookPayload);
              const signature = crypto
                .createHmac('sha256', webhookSecret)
                .update(rawBody)
                .digest('hex');

              await request(app)
                .post('/api/v1/payments/webhook')
                .set('Content-Type', 'application/json')
                .set('x-razorpay-signature', signature)
                .send(rawBody);
            } else if (text.includes('PAYMENT_SUCCESS')) {
              expect(text).toContain(testPrompt._id.toString());
              expect(text).toContain('Neon Cyberpunk Samurai');
              expect(text).toContain('Payment verified');
              req.destroy();
              resolve();
            }
          });
        }
      );

      req.on('error', (err) => {
        if (err.code !== 'ECONNRESET') reject(err);
      });
      req.end();
    });
  });
});
