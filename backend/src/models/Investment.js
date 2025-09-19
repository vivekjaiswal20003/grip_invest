'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Investment extends Model {
    static associate(models) {
      Investment.belongsTo(models.User, { foreignKey: 'userId' });
      Investment.belongsTo(models.InvestmentProduct, { foreignKey: 'productId', as: 'product' });
    }
  }
  Investment.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'product_id'
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    investedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'invested_at'
    },
    status: {
      type: DataTypes.ENUM('active', 'matured', 'cancelled'),
      defaultValue: 'active'
    },
    expectedReturn: {
      type: DataTypes.DECIMAL(12, 2),
      field: 'expected_return'
    },
    maturityDate: {
      type: DataTypes.DATEONLY,
      field: 'maturity_date'
    }
  }, {
    sequelize,
    modelName: 'Investment',
    tableName: 'investments',
    timestamps: false, // Timestamps are handled by invested_at
    createdAt: 'invested_at'
  });
  return Investment;
};
