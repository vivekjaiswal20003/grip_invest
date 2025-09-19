const request = require('supertest');
const app = require('../../src/index');
const db = require('../../src/models');

describe('Product API', () => {
  let adminToken;
  let userToken;
  let productId;

  beforeAll(async () => {
    await db.sequelize.sync({ force: true });

    // Create admin and user
    await request(app)
      .post('/api/auth/signup')
      .send({
        firstName: 'Admin',
        email: 'admin@test.com',
        password: 'password',
        isAdmin: true,
      });
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password' });
    adminToken = adminLogin.body.token;

    await request(app)
      .post('/api/auth/signup')
      .send({
        firstName: 'User',
        email: 'user@test.com',
        password: 'password',
      });
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password' });
    userToken = userLogin.body.token;
  });

  it('should allow admin to create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product',
        investmentType: 'etf',
        tenureMonths: 12,
        annualYield: 5.5,
        riskLevel: 'low',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    productId = res.body.id;
  });

  it('should not allow user to create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'User Product' });
    expect(res.statusCode).toEqual(403);
  });

  it('should fetch all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
  });

  it('should fetch a single product by id', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toBe('Test Product');
  });

  it('should allow admin to update a product', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Test Product' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toBe('Updated Test Product');
  });

  it('should get recommendations for a user', async () => {
    const res = await request(app)
      .get('/api/products/recommendations')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('recommendations');
  });

  it('should allow admin to delete a product', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Product removed');
  });

  afterAll(async () => {
    await db.sequelize.close();
  });
});
