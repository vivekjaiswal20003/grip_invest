
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./models');
const { errorHandler, notFoundHandler } = require('./api/middlewares/error.middleware');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Core Middlewares ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
const authRoutes = require('./api/routes/auth.routes');
const productRoutes = require('./api/routes/product.routes');
const investmentRoutes = require('./api/routes/investment.routes');
const logRoutes = require('./api/routes/log.routes');
const userRoutes = require('./api/routes/user.routes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/users', userRoutes);

// --- Health Check & Root Endpoint ---
app.get('/health', async (req, res, next) => {
  try {
    await db.sequelize.authenticate();
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      database: 'Connected',
    });
  } catch (error) {
    // Pass error to the centralized error handler
    error.statusCode = 503;
    next(error);
  }
});

app.get('/', (req, res) => {
  res.send('Grip Invest Backend is running...');
});

// --- Error Handling Middlewares ---
// Handle 404 for routes not found
app.use(notFoundHandler);
// Centralized error handler
app.use(errorHandler);

// --- Database Sync and Server Start ---
// Using { alter: true } is good for development but consider migrations for production
db.sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});

module.exports = app; // For testing purposes
