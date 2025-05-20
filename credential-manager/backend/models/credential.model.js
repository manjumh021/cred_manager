// backend/models/credential.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./user.model');
const Client = require('./client.model');
const { Platform } = require('./platform.model');
const encryptionUtils = require('../utils/encryption');

// Credential Model
const Credential = sequelize.define('Credential', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Client,
      key: 'id'
    }
  },
  platform_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Platform,
      key: 'id'
    }
  },
  account_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    },
    get() {
      const rawValue = this.getDataValue('username');
      return rawValue ? encryptionUtils.decrypt(rawValue) : null;
    },
    set(value) {
      if (value) {
        this.setDataValue('username', encryptionUtils.encrypt(value));
      }
    }
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    },
    get() {
      const rawValue = this.getDataValue('password');
      return rawValue ? encryptionUtils.decrypt(rawValue) : null;
    },
    set(value) {
      if (value) {
        this.setDataValue('password', encryptionUtils.encrypt(value));
      }
    }
  },
  url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  last_used: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'credentials',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Additional Credential Fields Model
const CredentialField = sequelize.define('CredentialField', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  credential_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Credential,
      key: 'id'
    }
  },
  field_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  field_value: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('field_value');
      return rawValue ? encryptionUtils.decrypt(rawValue) : null;
    },
    set(value) {
      if (value) {
        this.setDataValue('field_value', encryptionUtils.encrypt(value));
      }
    }
  }
}, {
  tableName: 'credential_fields',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
Credential.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
Credential.belongsTo(Platform, { foreignKey: 'platform_id', as: 'platform' });
Credential.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Credential.hasMany(CredentialField, { foreignKey: 'credential_id', as: 'additionalFields', onDelete: 'CASCADE' });
CredentialField.belongsTo(Credential, { foreignKey: 'credential_id', as: 'credential' });

Client.hasMany(Credential, { foreignKey: 'client_id', as: 'credentials' });
Platform.hasMany(Credential, { foreignKey: 'platform_id', as: 'credentials' });

module.exports = {
  Credential,
  CredentialField
};