// Game Killers Studio - JWT Utility
// Complete token generation and verification

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_super_secret_refresh_key_change_this_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Generate access token
function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

// Generate refresh token
function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

// Generate both tokens
function generateTokens(user) {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role || 'user',
    isAdmin: user.isAdmin || false,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken };
}

// Verify access token
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    throw new Error('Invalid token');
  }
}

// Verify refresh token
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    }
    throw new Error('Invalid refresh token');
  }
}

// Decode token without verification (for debugging)
function decodeToken(token) {
  return jwt.decode(token);
}

// Check if token is expired
function isTokenExpired(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    return decoded.exp < Date.now() / 1000;
  } catch {
    return true;
  }
}

// Extract token from Authorization header
function extractTokenFromHeader(authHeader) {
  if (!authHeader) return null;
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return authHeader;
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired,
  extractTokenFromHeader,
};