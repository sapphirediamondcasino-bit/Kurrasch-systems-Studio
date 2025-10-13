// Game Killers Studio - File Upload Middleware
// Multer configuration for avatars, posts, and games

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directories exist
const UPLOAD_DIRS = {
  avatars: path.join(__dirname, '../uploads/avatars'),
  posts: path.join(__dirname, '../uploads/posts'),
  games: path.join(__dirname, '../uploads/games'),
};

Object.values(UPLOAD_DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// File size limits
const FILE_LIMITS = {
  avatar: 5 * 1024 * 1024, // 5MB
  post: 10 * 1024 * 1024, // 10MB
  game: 50 * 1024 * 1024, // 50MB
};

// Allowed file types
const ALLOWED_TYPES = {
  avatar: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  post: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'],
  game: ['application/zip', 'application/x-zip-compressed', 'application/rbxl', 'application/rbxlx'],
};

// Storage configuration for avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIRS.avatars);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Storage configuration for posts
const postStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIRS.posts);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Storage configuration for games
const gameStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIRS.games);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter for avatars
const avatarFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.avatar.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type for avatar. Allowed: JPEG, PNG, GIF, WebP'), false);
  }
};

// File filter for posts
const postFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.post.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type for post. Allowed: Images (JPEG, PNG, GIF, WebP) or Videos (MP4, WebM)'), false);
  }
};

// File filter for games
const gameFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.game.includes(file.mimetype) || file.originalname.endsWith('.rbxl') || file.originalname.endsWith('.rbxlx')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type for game. Allowed: ZIP, RBXL, RBXLX'), false);
  }
};

// Multer instances
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: FILE_LIMITS.avatar },
  fileFilter: avatarFilter,
}).single('avatar');

const uploadPostMedia = multer({
  storage: postStorage,
  limits: { fileSize: FILE_LIMITS.post },
  fileFilter: postFilter,
}).array('media', 10); // Max 10 images/videos per post

const uploadGame = multer({
  storage: gameStorage,
  limits: { fileSize: FILE_LIMITS.game },
  fileFilter: gameFilter,
}).single('gameFile');

// Error handling wrapper
function handleUploadError(uploadFunction) {
  return (req, res, next) => {
    uploadFunction(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            error: 'File too large',
            maxSize: err.field === 'avatar' ? '5MB' : err.field === 'gameFile' ? '50MB' : '10MB',
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ 
            error: 'Too many files',
            maxFiles: 10,
          });
        }
        return res.status(400).json({ 
          error: err.message 
        });
      } else if (err) {
        return res.status(400).json({ 
          error: err.message 
        });
      }
      next();
    });
  };
}

// Delete file helper
async function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

// Delete old avatar when uploading new one
async function deleteOldAvatar(req, res, next) {
  if (!req.user || !req.file) {
    next();
    return;
  }

  const oldAvatar = req.user.avatar;
  if (oldAvatar && oldAvatar.startsWith('/uploads/avatars/')) {
    const oldPath = path.join(__dirname, '..', oldAvatar);
    await deleteFile(oldPath);
  }

  next();
}

// Clean up uploaded files on error
function cleanupOnError(req, res, next) {
  const originalSend = res.send;
  const originalJson = res.json;

  res.send = function (data) {
    if (res.statusCode >= 400 && req.file) {
      deleteFile(req.file.path);
    }
    if (res.statusCode >= 400 && req.files) {
      req.files.forEach(file => deleteFile(file.path));
    }
    originalSend.call(this, data);
  };

  res.json = function (data) {
    if (res.statusCode >= 400 && req.file) {
      deleteFile(req.file.path);
    }
    if (res.statusCode >= 400 && req.files) {
      req.files.forEach(file => deleteFile(file.path));
    }
    originalJson.call(this, data);
  };

  next();
}

// Validate image dimensions
async function validateImageDimensions(req, res, next) {
  if (!req.file || !req.file.mimetype.startsWith('image/')) {
    next();
    return;
  }

  // This would use sharp or jimp to validate dimensions
  // For now, just pass through
  next();
}

module.exports = {
  uploadAvatar: [cleanupOnError, handleUploadError(uploadAvatar), deleteOldAvatar],
  uploadPostMedia: [cleanupOnError, handleUploadError(uploadPostMedia)],
  uploadGame: [cleanupOnError, handleUploadError(uploadGame)],
  deleteFile,
  UPLOAD_DIRS,
  FILE_LIMITS,
};