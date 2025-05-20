// backend/models/activity.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./user.model');

// Activity Logs Model
const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  action_type: {
    type: DataTypes.ENUM('create', 'read', 'update', 'delete', 'export', 'login', 'logout'),
    allowNull: false
  },
  entity_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['user', 'client', 'credential', 'platform', 'export']]
    }
  },
  entity_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'activity_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Export Logs Model
const ExportLog = sequelize.define('ExportLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  export_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  record_count: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  filters: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  }
}, {
  tableName: 'export_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Define associations
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
ExportLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'activityLogs' });
User.hasMany(ExportLog, { foreignKey: 'user_id', as: 'exportLogs' });

module.exports = {
  ActivityLog,
  ExportLog
};