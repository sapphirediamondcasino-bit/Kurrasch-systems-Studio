// Game Killers Studio - Validation Middleware
// Input validation and sanitization

const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array() 
    });
  }
  
  next();
}

// User registration validation
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('username')
    .isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 3-20 characters, alphanumeric with _ or -'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
  body('displayName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be 1-50 characters'),
  handleValidationErrors,
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('password')
    .notEmpty()
    .withMessage('Password required'),
  handleValidationErrors,
];

// Post creation validation
const validatePost = [
  body('content')
    .notEmpty()
    .isLength({ max: 5000 })
    .withMessage('Post content required (max 5000 characters)')
    .trim(),
  body('type')
    .optional()
    .isIn(['text', 'image', 'video', 'link'])
    .withMessage('Invalid post type'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  handleValidationErrors,
];

// Comment validation
const validateComment = [
  body('content')
    .notEmpty()
    .isLength({ max: 1000 })
    .withMessage('Comment required (max 1000 characters)')
    .trim(),
  handleValidationErrors,
];

// Game upload validation
const validateGame = [
  body('title')
    .notEmpty()
    .isLength({ min: 3, max: 100 })
    .withMessage('Game title required (3-100 characters)')
    .trim(),
  body('description')
    .notEmpty()
    .isLength({ max: 2000 })
    .withMessage('Description required (max 2000 characters)')
    .trim(),
  body('gameUrl')
    .optional()
    .isURL()
    .withMessage('Valid game URL required'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  handleValidationErrors,
];

// Movie Night session validation
const validateMovieNight = [
  body('title')
    .notEmpty()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title required (3-100 characters)')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description max 500 characters')
    .trim(),
  body('movieUrl')
    .notEmpty()
    .isURL()
    .withMessage('Valid movie URL required'),
  body('scheduledTime')
    .optional()
    .isISO8601()
    .withMessage('Valid date/time required'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 2, max: 100 })
    .withMessage('Max participants must be 2-100'),
  handleValidationErrors,
];

// AI chat validation
const validateAIChat = [
  body('message')
    .notEmpty()
    .isLength({ max: 1000 })
    .withMessage('Message required (max 1000 characters)')
    .trim(),
  param('avatarName')
    .isIn([
      'bettywhite', 'robinwilliams', 'johnnyhardwick', 'jonathanjoss',
      'dianekeaton', 'shelleyduvall', 'michelletrachtenberg', 'jamesearlJones',
      'matthewperry', 'johncandy', 'chrisfarley', 'haroldramis'
    ])
    .withMessage('Invalid AI avatar name'),
  handleValidationErrors,
];

// Profile update validation
const validateProfileUpdate = [
  body('displayName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be 1-50 characters')
    .trim(),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio max 500 characters')
    .trim(),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location max 100 characters')
    .trim(),
  body('website')
    .optional()
    .isURL()
    .withMessage('Valid website URL required'),
  handleValidationErrors,
];

// Team Builder validation
const validateTeamBuilder = [
  body('title')
    .notEmpty()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title required (3-100 characters)')
    .trim(),
  body('description')
    .notEmpty()
    .isLength({ max: 1000 })
    .withMessage('Description required (max 1000 characters)')
    .trim(),
  body('roles')
    .isArray({ min: 1 })
    .withMessage('At least one role required'),
  body('maxMembers')
    .optional()
    .isInt({ min: 2, max: 50 })
    .withMessage('Max members must be 2-50'),
  handleValidationErrors,
];

// Build Battle validation
const validateBuildBattle = [
  body('title')
    .notEmpty()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title required (3-100 characters)')
    .trim(),
  body('theme')
    .notEmpty()
    .isLength({ max: 200 })
    .withMessage('Theme required (max 200 characters)')
    .trim(),
  body('duration')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be 15-480 minutes'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 2, max: 50 })
    .withMessage('Max participants must be 2-50'),
  handleValidationErrors,
];

// Idea Vault validation
const validateIdea = [
  body('title')
    .notEmpty()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title required (3-100 characters)')
    .trim(),
  body('description')
    .notEmpty()
    .isLength({ max: 2000 })
    .withMessage('Description required (max 2000 characters)')
    .trim(),
  body('category')
    .optional()
    .isIn(['game', 'feature', 'mechanic', 'story', 'art', 'other'])
    .withMessage('Invalid category'),
  handleValidationErrors,
];

// Project Hub validation
const validateProject = [
  body('title')
    .notEmpty()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title required (3-100 characters)')
    .trim(),
  body('description')
    .notEmpty()
    .isLength({ max: 2000 })
    .withMessage('Description required (max 2000 characters)')
    .trim(),
  body('status')
    .optional()
    .isIn(['planning', 'in-progress', 'completed', 'on-hold'])
    .withMessage('Invalid project status'),
  handleValidationErrors,
];

// Goal Tracker validation
const validateGoal = [
  body('title')
    .notEmpty()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title required (3-100 characters)')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description max 500 characters')
    .trim(),
  body('targetDate')
    .optional()
    .isISO8601()
    .withMessage('Valid target date required'),
  handleValidationErrors,
];

// Marketplace validation
const validateMarketplaceItem = [
  body('title')
    .notEmpty()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title required (3-100 characters)')
    .trim(),
  body('description')
    .notEmpty()
    .isLength({ max: 2000 })
    .withMessage('Description required (max 2000 characters)')
    .trim(),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Valid price required'),
  body('category')
    .isIn(['asset', 'script', 'model', 'sound', 'other'])
    .withMessage('Invalid category'),
  handleValidationErrors,
];

// Sanitize HTML content
function sanitizeHTML(content) {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

// Content moderation check
async function moderateContent(req, res, next) {
  const content = req.body.content || req.body.message || req.body.description;
  
  if (!content) {
    next();
    return;
  }

  // Basic profanity filter (expand as needed)
  const bannedWords = ['spam', 'scam']; // Add more
  const lowerContent = content.toLowerCase();
  
  for (const word of bannedWords) {
    if (lowerContent.includes(word)) {
      return res.status(400).json({ 
        error: 'Content contains inappropriate language' 
      });
    }
  }

  // Sanitize HTML
  if (typeof content === 'string') {
    req.body.content = sanitizeHTML(content);
  }

  next();
}

module.exports = {
  validateRegistration,
  validateLogin,
  validatePost,
  validateComment,
  validateGame,
  validateMovieNight,
  validateAIChat,
  validateProfileUpdate,
  validateTeamBuilder,
  validateBuildBattle,
  validateIdea,
  validateProject,
  validateGoal,
  validateMarketplaceItem,
  moderateContent,
  sanitizeHTML,
};