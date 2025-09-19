'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InvestmentProduct extends Model {
    static associate(models) {
      InvestmentProduct.hasMany(models.Investment, { foreignKey: 'productId' });
    }
  }
  InvestmentProduct.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    investmentType: {
      type: DataTypes.ENUM('bond', 'fd', 'mf', 'etf', 'other'),
      allowNull: false,
      field: 'investment_type'
    },
    tenureMonths: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenure_months'
    },
    annualYield: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'annual_yield'
    },
    riskLevel: {
      type: DataTypes.ENUM('low', 'moderate', 'high'),
      allowNull: false,
      field: 'risk_level'
    },
    minInvestment: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 1000.00,
      field: 'min_investment'
    },
    maxInvestment: {
      type: DataTypes.DECIMAL(12, 2),
      field: 'max_investment'
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'InvestmentProduct',
    tableName: 'investment_products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return InvestmentProduct;
};
