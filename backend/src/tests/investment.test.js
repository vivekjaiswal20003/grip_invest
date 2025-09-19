const request = require('supertest');
const app = require('../../src/index');
const db = require('../../src/models');

describe('Investment API', () => {
  let token;
  let productId;
  let userId;

  beforeAll(async () => {
    await db.sequelize.sync({ force: true });

    const userRes = await request(app)
      .post('/api/auth/signup')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'invest@test.com',
        password: 'password',
        balance: 50000,
      });
    token = userRes.body.token;
    userId = userRes.body.id;

    const product = await db.InvestmentProduct.create({
      name: 'Test Fund',
      investmentType: 'mf',
      tenureMonths: 12,
      annualYield: 8.0,
      riskLevel: 'moderate',
      minInvestment: 1000,
    });
    productId = product.id;
  });

  it('should allow a user to make an investment', async () => {
    const res = await request(app)
      .post('/api/investments')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, amount: 2000 });

    expect(res.statusCode).toEqual(201);
    expect(res.body.amount).toBe(2000.00);
  });

  it('should not allow investment with insufficient balance', async () => {
    const res = await request(app)
      .post('/api/investments')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, amount: 100000 });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Insufficient balance');
  });

  it('should fetch user portfolio', async () => {
    const res = await request(app)
      .get('/api/investments')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('totalInvested');
    expect(res.body.investments.length).toBe(1);
  });

  it('should fetch AI portfolio summary', async () => {
    const res = await request(app)
      .get('/api/investments/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('summary');
  });

  afterAll(async () => {
    await db.sequelize.close();
  });
});
