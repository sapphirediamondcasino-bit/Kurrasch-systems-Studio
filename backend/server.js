// Game Killers Studio - Main Server
// Production-ready backend with full feature implementation

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
require('dotenv').config();

// Initialize Express
const app = express();

// Import utilities
const { initializeDatastore } = require('./utils/datastore');
const { startAIWorker } = require('./utils/aiWorker');
const { startSubscriptionWorker } = require('./utils/subscriptionWorker');
const { startBadgeWorker } = require('./utils/badgeWorker');
const { startMovieNightWorker } = require('./utils/movieNightWorker');

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');
const subscriptionRoutes = require('./routes/subscriptions');
const badgeRoutes = require('./routes/badges');
const gameRoutes = require('./routes/games');
const movieNightRoutes = require('./routes/movieNight');
const adminRoutes = require('./routes/admin');
const teamBuilderRoutes = require('./routes/teamBuilder');
const buildBattlesRoutes = require('./routes/buildBattles');
const ideaVaultRoutes = require('./routes/ideaVault');
const projectHubRoutes = require('./routes/projectHub');
const goalTrackerRoutes = require('./routes/goalTracker');
const miniArcadeRoutes = require('./routes/miniArcade');
const marketplaceRoutes = require('./routes/marketplace');
const notificationRoutes = require('./routes/notifications');
const xpRoutes = require('./routes/xp');
const friendRoutes = require('./routes/friends');
const followerRoutes = require('./routes/followers');

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body Parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Logging
app.use(morgan('combined'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/movienight', movieNightRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teambuilder', teamBuilderRoutes);
app.use('/api/buildbattles', buildBattlesRoutes);
app.use('/api/ideavault', ideaVaultRoutes);
app.use('/api/projecthub', projectHubRoutes);
app.use('/api/goaltracker', goalTrackerRoutes);
app.use('/api/miniarcade', miniArcadeRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/xp', xpRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/followers', followerRoutes);

// Discord Bot Integration
app.get('/api/bot/status', (req, res) => {
  res.json({
    online: true,
    features: ['Moderation', 'Roblox Integration', 'Security', 'Auto-mod', 'Welcome'],
    invite: process.env.SUPPORT_SERVER_INVITE || 'https://discord.gg/jR8tcWF',
  });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: { message: err.message || 'Internal server error', status: err.status || 500 },
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Route not found', status: 404 } });
});

// Initialize Server
async function startServer() {
  try {
    console.log('Initializing datastore...');
    await initializeDatastore();
    console.log('Datastore initialized');

    console.log('Starting background workers...');
    startAIWorker();
    startSubscriptionWorker();
    startBadgeWorker();
    startMovieNightWorker();
    console.log('Background workers started');

    const PORT = process.env.STUDIOS_PORT || 25808;
    
    if (process.env.NODE_ENV === 'production' && process.env.SSL_KEY && process.env.SSL_CERT) {
      const sslOptions = {
        key: fs.readFileSync(process.env.SSL_KEY),
        cert: fs.readFileSync(process.env.SSL_CERT),
      };
      
      https.createServer(sslOptions, app).listen(PORT, () => {
        console.log(`🔒 HTTPS Server running on port ${PORT}`);
        console.log(`🚀 Game Killers Studio Backend is live!`);
      });
    } else {
      http.createServer(app).listen(PORT, () => {
        console.log(`🌐 HTTP Server running on port ${PORT}`);
        console.log(`🚀 Game Killers Studio Backend is live!`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  process.exit(0);
});

startServer();

module.exports = app;