// backend/models/platform.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

// Platform Category Model
const PlatformCategory = sequelize.define('PlatformCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'platform_categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Platform Model
const Platform = sequelize.define('Platform', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: PlatformCategory,
      key: 'id'
    }
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  logo_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'platforms',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
Platform.belongsTo(PlatformCategory, { foreignKey: 'category_id', as: 'category' });
PlatformCategory.hasMany(Platform, { foreignKey: 'category_id', as: 'platforms' });

module.exports = {
  Platform,
  PlatformCategory
};