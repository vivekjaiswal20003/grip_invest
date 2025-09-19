const { TransactionLog } = require('../../models');

const logTransaction = async (req, res, next) => {
  const originalSend = res.send;
  let responseBody = null;

  res.send = function (body) {
    responseBody = body;
    originalSend.apply(res, arguments);
  };

  res.on('finish', async () => {
    try {
      await TransactionLog.create({
        userId: req.user ? req.user.id : null,
        email: req.user ? req.user.email : null,
        endpoint: req.originalUrl,
        httpMethod: req.method,
        statusCode: res.statusCode,
        errorMessage: res.statusCode >= 400 ? responseBody : null,
      });
    } catch (error) {
      console.error('Failed to log transaction:', error);
    }
  });

  next();
};

module.exports = { logTransaction };
