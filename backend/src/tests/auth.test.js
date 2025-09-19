const request = require('supertest');
const app = require('../../src/index'); // Adjust path as needed
const db = require('../../src/models');

describe('Auth API', () => {
  beforeAll(async () => {
    // Sync database and clear tables before tests
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Close the database connection after all tests are done
    await db.sequelize.close();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        riskAppetite: 'moderate',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toEqual('test@example.com');
  });

  it('should not register a user with existing email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        firstName: 'Another',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        riskAppetite: 'low',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('User with this email already exists.');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toEqual('test@example.com');
  });

  it('should not login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid email or password.');
  });

  it('should get password strength feedback', async () => {
    const res = await request(app)
      .post('/api/auth/password-strength')
      .send({
        password: 'weak',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('strength');
    expect(typeof res.body.strength).toBe('string');
  });
});
