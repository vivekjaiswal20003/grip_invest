'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TransactionLog extends Model {
    static associate(models) {
      TransactionLog.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  TransactionLog.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true, // Can be null for public endpoints
      field: 'user_id'
    },
    email: {
      type: DataTypes.STRING
    },
    endpoint: {
      type: DataTypes.STRING,
      allowNull: false
    },
    httpMethod: {
      type: DataTypes.ENUM('GET', 'POST', 'PUT', 'DELETE'),
      allowNull: false,
      field: 'http_method'
    },
    statusCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'status_code'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      field: 'error_message'
    }
  }, {
    sequelize,
    modelName: 'TransactionLog',
    tableName: 'transaction_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false // No updatedAt field for logs
  });
  return TransactionLog;
};
