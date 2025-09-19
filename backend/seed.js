const { v4: uuidv4 } = require('uuid');
const db = require('./src/models');

/**
 * @file Seeds the database with initial data for development.
 * @module seeder
 */

/**
 * Creates a default admin and a regular user.
 */
const seedUsers = async () => {
  const adminUser = await db.User.create({
    id: uuidv4(),
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    passwordHash: 'admin123', // The model hook will hash this.
    riskAppetite: 'high',
    isAdmin: true,
  });
  console.log(`Admin user created: ${adminUser.email}`);

  const regularUser = await db.User.create({
    id: uuidv4(),
    firstName: 'Regular',
    lastName: 'User',
    email: 'user@example.com',
    passwordHash: 'user123', // The model hook will hash this.
    riskAppetite: 'moderate',
    isAdmin: false,
  });
  console.log(`Regular user created: ${regularUser.email}`);

  return { adminUser, regularUser };
};

/**
 * Creates a set of default investment products.
 */
const seedProducts = async () => {
  const products = await db.InvestmentProduct.bulkCreate([
    {
      id: uuidv4(),
      name: 'Tech Growth Fund',
      investmentType: 'mf',
      tenureMonths: 60,
      annualYield: 12.50,
      riskLevel: 'high',
      minInvestment: 5000.00,
      maxInvestment: 50000.00,
      description: 'Invest in leading technology companies for high growth potential.',
    },
    {
      id: uuidv4(),
      name: 'Stable Bond Fund',
      investmentType: 'bond',
      tenureMonths: 36,
      annualYield: 6.00,
      riskLevel: 'low',
      minInvestment: 1000.00,
      maxInvestment: 100000.00,
      description: 'Secure your capital with government and corporate bonds.',
    },
    {
      id: uuidv4(),
      name: 'Real Estate ETF',
      investmentType: 'etf',
      tenureMonths: 120,
      annualYield: 8.75,
      riskLevel: 'moderate',
      minInvestment: 2000.00,
      maxInvestment: 75000.00,
      description: 'Gain exposure to the real estate market through a diversified ETF.',
    },
    {
      id: uuidv4(),
      name: 'High-Yield FD',
      investmentType: 'fd',
      tenureMonths: 24,
      annualYield: 7.25,
      riskLevel: 'low',
      minInvestment: 500.00,
      maxInvestment: 20000.00,
      description: 'Fixed deposit with attractive returns for short to medium term.',
    },
  ]);
  console.log('Investment products created.');
  return products;
};

/**
 * Creates an initial investment for the regular user.
 * @param {object} regularUser - The user to create the investment for.
 * @param {Array} products - The list of available products.
 */
const seedInvestments = async (regularUser, products) => {
  const techFund = products.find(p => p.name === 'Tech Growth Fund');
  if (!techFund) {
    console.warn('Could not find "Tech Growth Fund" to create an initial investment.');
    return;
  }

  await db.Investment.create({
    id: uuidv4(),
    userId: regularUser.id,
    productId: techFund.id,
    amount: 5000.00,
    expectedReturn: 5000 * (1 + (techFund.annualYield / 100) * (techFund.tenureMonths / 12)),
    maturityDate: new Date(new Date().setMonth(new Date().getMonth() + techFund.tenureMonths)),
  });
  console.log('Initial investment created for the regular user.');
};

/**
 * Main function to orchestrate the database seeding process.
 */
const seedDatabase = async () => {
  try {
    // Drop existing tables and recreate them.
    await db.sequelize.sync({ force: true });
    console.log('Database synced successfully.');

    const { regularUser } = await seedUsers();
    const products = await seedProducts();
    await seedInvestments(regularUser, products);

    console.log('Database seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection.
    await db.sequelize.close();
  }
};

// Run the seeder
seedDatabase();
