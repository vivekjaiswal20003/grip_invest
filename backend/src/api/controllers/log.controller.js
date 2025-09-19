const { TransactionLog, User } = require('../../models');
const { Op } = require('sequelize');
const { summarizeError } = require('../../services/ai.service');

// @desc    Get all transaction logs
// @route   GET /api/logs
// @access  Private/Admin
const getLogs = async (req, res) => {
  const { userId, email } = req.query;
  const whereClause = {};

  if (userId) {
    whereClause.userId = userId;
  }

  if (email) {
    whereClause.email = { [Op.like]: `%${email}%` };
  }

  try {
    const logs = await TransactionLog.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'email'],
        required: false, // Use a LEFT JOIN to include logs even without a user
      }],
      limit: 100, // Limit to the last 100 logs for performance
    });

    // Summarize errors using AI and return data in camelCase
    const logsWithAiSummary = await Promise.all(logs.map(async (log) => {
      let aiSummary = null;

      if (log.errorMessage) {
        try {
          aiSummary = await summarizeError(log.errorMessage);
        } catch (aiError) {
          console.error(`AI summarization failed for log ID ${log.id}:`, aiError.message);
          aiSummary = `AI summary failed: ${aiError.message}`;
        }
      }

      return {
        id: log.id,
        userId: log.userId,
        email: log.email,
        endpoint: log.endpoint,
        httpMethod: log.httpMethod,
        statusCode: log.statusCode,
        errorMessage: log.errorMessage,
        createdAt: log.createdAt,
        aiSummary: aiSummary,
        User: log.User
      };
    }));

    res.json(logsWithAiSummary);
  } catch (error) {
    console.error('Error in getLogs:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { getLogs };
