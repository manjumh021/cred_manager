// backend/config/auth.config.js
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  secret: process.env.JWT_SECRET || 'credential-manager-secret-key',
  jwtExpiration: 86400, // 24 hours
  jwtRefreshExpiration: 604800, // 7 days
  saltRounds: 10, // For bcrypt password hashing
  encryptionKey: process.env.ENCRYPTION_KEY || 'credential-encryption-key-32chars',
  encryptionIV: process.env.ENCRYPTION_IV || 'credential-iv-16c',
  algorithm: 'aes-256-cbc' // Algorithm used for credential encryption/decryption
};