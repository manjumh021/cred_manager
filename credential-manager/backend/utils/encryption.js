// backend/utils/encryption.js
const crypto = require('crypto');
const authConfig = require('../config/auth.config');

/**
 * Encryption utility for securing sensitive credential data
 */
class EncryptionUtil {
  constructor() {
    this.algorithm = authConfig.algorithm;
    this.key = Buffer.from(authConfig.encryptionKey, 'utf8').slice(0, 32); // Ensure key is 32 bytes for AES-256
    this.ivLength = 16; // 16 bytes for AES
  }

  /**
   * Encrypts a string value
   * @param {string} text - Text to encrypt
   * @returns {string} - Encrypted text (hex encoded)
   */
  encrypt(text) {
    if (!text) return null;
    
    try {
      // Generate a random initialization vector
      const iv = crypto.randomBytes(this.ivLength);
      
      // Create cipher with key and iv
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      
      // Encrypt the text
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Prepend the IV to the encrypted data (IV is needed for decryption)
      // Store as: IV (hex) + ':' + encrypted data (hex)
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypts an encrypted string
   * @param {string} encryptedText - Encrypted text to decrypt (hex encoded with IV)
   * @returns {string} - Decrypted text
   */
  decrypt(encryptedText) {
    if (!encryptedText) return null;
    
    try {
      // Split the encrypted text to get the IV and the encrypted data
      const parts = encryptedText.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      // Create decipher with key and iv
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      
      // Decrypt the data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Generates a random password
   * @param {number} length - Length of the password
   * @param {Object} options - Password generation options
   * @returns {string} - Generated password
   */
  generateRandomPassword(length = 16, options = {}) {
    const defaults = {
      lowercase: true,
      uppercase: true,
      numbers: true,
      symbols: true
    };
    
    const config = { ...defaults, ...options };
    
    let chars = '';
    if (config.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (config.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (config.numbers) chars += '0123456789';
    if (config.symbols) chars += '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    if (chars.length === 0) {
      throw new Error('At least one character type must be enabled');
    }
    
    let password = '';
    const randomValues = crypto.randomBytes(length);
    
    for (let i = 0; i < length; i++) {
      password += chars[randomValues[i] % chars.length];
    }
    
    return password;
  }
}

module.exports = new EncryptionUtil();