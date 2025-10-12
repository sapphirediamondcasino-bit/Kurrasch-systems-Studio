require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

const app = express();

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
const buildBattleRoutes = require('./routes/buildBattles');
const ideaVaultRoutes = require('./routes/ideaVault');
const projectHubRoutes = require('./routes/projectHub');
const goalTrackerRoutes = require('./routes/goalTracker');
const miniArcadeRoutes = require('./routes/miniArcade');
const marketplaceRoutes = require('./routes/marketplace');
const notificationRoutes = require('./routes/notifications');
const xpRoutes = require('./routes/xp');
const friendRoutes = require('./routes/friends');
const followerRoutes = require('./routes/followers');

// Import utilities
const { initDatastore } = require('./utils/datastore');
const { runAILearning } = require('./utils/aiWorker');
const { checkSubscriptions } = require('./utils/subscriptionWorker');
const { verifyBadges } = require('./utils/badgeWorker');
const { cleanupMovieNights } = require('./utils/movieNightWorker');

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'gks-super-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Routes
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
app.use('/api/buildbattles', buildBattleRoutes);
app.use('/api/ideavault', ideaVaultRoutes);
app.use('/api/projecthub', projectHubRoutes);
app.use('/api/goaltracker', goalTrackerRoutes);
app.use('/api/miniarcade', miniArcadeRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/xp', xpRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/followers', followerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize datastore and start server
async function startServer() {
  try {
    await initDatastore();
    console.log('✓ Datastore initialized');

    // Setup cron jobs
    cron.schedule('0 */6 * * *', runAILearning);
    cron.schedule('0 0 * * *', checkSubscriptions);
    cron.schedule('0 */12 * * *', verifyBadges);
    cron.schedule('0 */2 * * *', cleanupMovieNights);
    console.log('✓ Cron jobs scheduled');

    const PORT = process.env.PORT || 5000;
    
    if (process.env.NODE_ENV === 'production' && process.env.SSL_KEY && process.env.SSL_CERT) {
      const privateKey = await fs.readFile(process.env.SSL_KEY, 'utf8');
      const certificate = await fs.readFile(process.env.SSL_CERT, 'utf8');
      const credentials = { key: privateKey, cert: certificate };
      
      const httpsServer = https.createServer(credentials, app);
      httpsServer.listen(PORT, () => {
        console.log(`✓ HTTPS Server running on port ${PORT}`);
      });
    } else {
      app.listen(PORT, () => {
        console.log(`✓ HTTP Server running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;