import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('Auth Endpoints & Validation Suite', () => {
  it('GET /api/v1/health should return 200 OK with server status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/v1/users/verify should return 401 Unauthorized when token cookie is missing', async () => {
    const res = await request(app).get('/api/v1/users/verify');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Unauthorized');
  });

  it('POST /api/v1/users/signup should reject missing fields with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/v1/users/signup')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('required');
  });

  it('POST /api/v1/users/signup should enforce password minimum length', async () => {
    const res = await request(app)
      .post('/api/v1/users/signup')
      .send({ username: 'shortpassuser', email: 'short@example.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('at least 6 characters');
  });

  it('POST /api/v1/users/login should reject empty credentials with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
