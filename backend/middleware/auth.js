// Game Killers Studio - Authentication Middleware
// JWT verification and role-based access control

const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwt');
const { users } = require('../utils/datastore');

// Verify JWT token
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required' 
      });
    }

    const decoded = verifyAccessToken(token);
    
    // Fetch full user data
    const user = await users.getById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found' 
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    if (error.message === 'Token expired') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED' 
      });
    }
    
    return res.status(403).json({ 
      error: 'Invalid token' 
    });
  }
}

// Optional authentication (doesn't fail if no token)
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await users.getById(decoded.id);
      
      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}

// Check if user is admin
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required' 
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ 
      error: 'Admin access required' 
    });
  }

  next();
}

// Check if user is group admin or site admin
function requireGroupAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required' 
    });
  }

  if (!req.user.isAdmin && !req.user.isGroupAdmin) {
    return res.status(403).json({ 
      error: 'Group admin access required' 
    });
  }

  next();
}

// Check subscription tier
function requireSubscription(minTier = 1) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    const userTier = req.user.subscriptionTier || 0;
    
    if (userTier < minTier) {
      return res.status(403).json({ 
        error: `Subscription tier ${minTier} or higher required`,
        currentTier: userTier,
        requiredTier: minTier,
      });
    }

    next();
  };
}

// Check if user has credits
function requireCredits(type = 'ad', amount = 1) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    const creditKey = type === 'ad' ? 'adCredits' : 'aiCredits';
    const userCredits = req.user[creditKey] || 0;

    // Tier 5 has unlimited credits (represented as -1)
    if (userCredits === -1) {
      next();
      return;
    }

    if (userCredits < amount) {
      return res.status(403).json({ 
        error: `Insufficient ${type} credits`,
        required: amount,
        available: userCredits,
      });
    }

    next();
  };
}

// Verify Discord bot authentication
async function authenticateBot(req, res, next) {
  try {
    const botToken = req.headers['x-bot-token'];
    
    if (!botToken) {
      return res.status(401).json({ 
        error: 'Bot token required' 
      });
    }

    // Verify bot token matches Discord bot token
    if (botToken !== process.env.DISCORD_TOKEN) {
      return res.status(403).json({ 
        error: 'Invalid bot token' 
      });
    }

    req.isBot = true;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Bot authentication failed' 
    });
  }
}

// Rate limiting per user
const userRateLimits = new Map();

function rateLimitPerUser(maxRequests = 100, windowMs = 60000) {
  return (req, res, next) => {
    if (!req.userId) {
      next();
      return;
    }

    const now = Date.now();
    const userKey = req.userId;
    
    if (!userRateLimits.has(userKey)) {
      userRateLimits.set(userKey, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    const userLimit = userRateLimits.get(userKey);
    
    if (now > userLimit.resetTime) {
      userRateLimits.set(userKey, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (userLimit.count >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests',
        resetTime: new Date(userLimit.resetTime).toISOString(),
      });
    }

    userLimit.count++;
    next();
  };
}

// Check if user owns resource
async function requireOwnership(resourceType) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    const resourceId = req.params.id;
    const { [resourceType]: datastore } = require('../utils/datastore');
    
    const resource = await datastore.getById(resourceId);
    
    if (!resource) {
      return res.status(404).json({ 
        error: `${resourceType} not found` 
      });
    }

    // Admins can access everything
    if (req.user.isAdmin) {
      next();
      return;
    }

    // Check ownership
    if (resource.userId !== req.user.id && resource.hostId !== req.user.id) {
      return res.status(403).json({ 
        error: 'Access denied - not the owner' 
      });
    }

    req.resource = resource;
    next();
  };
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  requireGroupAdmin,
  requireSubscription,
  requireCredits,
  authenticateBot,
  rateLimitPerUser,
  requireOwnership,
};