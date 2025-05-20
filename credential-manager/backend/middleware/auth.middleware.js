// backend/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');
const User = require('../models/user.model');
const { ActivityLog } = require('../models/activity.model');

/**
 * Middleware for JWT verification and authentication
 */
module.exports = {
  /**
   * Verifies if the JWT token is valid
   */
  verifyToken: async (req, res, next) => {
    try {
      // Get token from authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          status: 'error',
          message: 'No token provided'
        });
      }
      
      const token = authHeader.split(' ')[1];
      
      // Verify token
      jwt.verify(token, authConfig.secret, async (err, decoded) => {
        if (err) {
          return res.status(401).json({
            status: 'error',
            message: 'Unauthorized! Token is invalid or expired'
          });
        }
        
        // Check if user exists and is active
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
          return res.status(401).json({
            status: 'error',
            message: 'User not found'
          });
        }
        
        if (!user.is_active) {
          return res.status(403).json({
            status: 'error',
            message: 'Account is deactivated'
          });
        }
        
        // Set user in request
        req.user = user;
        next();
      });
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to authenticate token'
      });
    }
  },
  
  /**
   * Checks if the user is an admin
   */
  isAdmin: (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized!'
      });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Require Admin Role!'
      });
    }
    
    next();
  },
  
  /**
   * Checks if the user is a manager or admin
   */
  isManagerOrAdmin: (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized!'
      });
    }
    
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Require Manager or Admin Role!'
      });
    }
    
    next();
  },
  
  /**
   * Logs the API request activity
   */
  logActivity: (actionType) => {
    return async (req, res, next) => {
      const originalSend = res.send;
      
      res.send = function(data) {
        res.send = originalSend;
        
        // Only log if the request is successful
        if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
          let entityType = req.baseUrl.split('/').pop();
          let entityId = req.params.id || null;
          
          // Remove 's' from the end of entity type (e.g. 'users' -> 'user')
          if (entityType.endsWith('s')) {
            entityType = entityType.slice(0, -1);
          }
          
          ActivityLog.create({
            user_id: req.user.id,
            action_type: actionType,
            entity_type: entityType,
            entity_id: entityId,
            description: `${actionType} ${entityType}${entityId ? ` #${entityId}` : ''}`,
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
          }).catch(err => console.error('Error logging activity:', err));
        }
        
        return originalSend.call(this, data);
      };
      
      next();
    };
  }
};