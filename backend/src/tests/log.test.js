const request = require('supertest');
const app = require('../../src/index');
const db = require('../../src/models');

describe('Log API', () => {
  let adminToken;

  beforeAll(async () => {
    await db.sequelize.sync({ force: true });

    await request(app)
      .post('/api/auth/signup')
      .send({
        firstName: 'Admin',
        email: 'admin-log@test.com',
        password: 'password',
        isAdmin: true,
      });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin-log@test.com', password: 'password' });
    adminToken = adminLogin.body.token;

    // Generate some logs by making requests
    await request(app).get('/api/products').set('Authorization', `Bearer ${adminToken}`);
    await request(app).get('/health').set('Authorization', `Bearer ${adminToken}`);
  });

  it('should fetch all logs for admin', async () => {
    const res = await request(app)
      .get('/api/logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('should filter logs by endpoint', async () => {
    const res = await request(app)
      .get('/api/logs?endpoint=/health')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body.some(log => log.endpoint === '/health')).toBe(true);
  });

  afterAll(async () => {
    await db.sequelize.close();
  });
});
