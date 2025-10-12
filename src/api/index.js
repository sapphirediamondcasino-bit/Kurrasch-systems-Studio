// src/api/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const API_PORT = 25230;

// Middleware
app.use(cors());
app.use(express.json());

// Database path
const dbPath = path.join(__dirname, '../database/data/database.json');

// Helper to read database
function readDB() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database:', err);
    return { users: [], servers: [], incidents: [], reports: [] };
  }
}

// Helper to write database
function writeDB(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing database:', err);
    return false;
  }
}

// ==================== AUTH ROUTES ====================
app.post('/api/login', (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Discord code required' });
  }
  // Discord OAuth handled client-side, this confirms user
  res.json({ success: true, message: 'Login successful' });
});

app.get('/api/user/:userId', (req, res) => {
  const db = readDB();
  const user = db.users?.find(u => u.id === req.params.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

// ==================== STATS ROUTES ====================
app.get('/api/stats', (req, res) => {
  const db = readDB();
  
  const stats = {
    discord: {
      serversProtected: db.servers?.length || 0,
      threatsBlocked: db.incidents?.filter(i => i.resolved).length || 0,
      membersSecured: db.users?.length || 0,
      uptimePercent: 99.9,
      activeAlerts: db.incidents?.filter(i => !i.resolved).length || 0,
      recentThreats: db.incidents?.slice(0, 3) || []
    },
    roblox: {
      gamesProtected: db.servers?.filter(s => s.type === 'roblox').length || 0,
      exploitsBlocked: db.incidents?.filter(i => i.type === 'exploit').length || 0,
      playersMonitored: db.users?.length || 0,
      pluginVersion: '2.5.3',
      activeGames: db.servers?.filter(s => s.type === 'roblox' && s.active).length || 0,
      recentDetections: db.incidents?.filter(i => i.type === 'exploit').slice(0, 3) || []
    }
  };
  
  res.json(stats);
});

// ==================== SERVER/GUILD ROUTES ====================
app.get('/api/servers', (req, res) => {
  const db = readDB();
  const servers = db.servers || [];
  res.json(servers);
});

app.get('/api/servers/:serverId', (req, res) => {
  const db = readDB();
  const server = db.servers?.find(s => s.id === req.params.serverId);
  
  if (!server) {
    return res.status(404).json({ error: 'Server not found' });
  }
  
  res.json(server);
});

app.get('/api/servers/:serverId/stats', (req, res) => {
  const db = readDB();
  const server = db.servers?.find(s => s.id === req.params.serverId);
  
  if (!server) {
    return res.status(404).json({ error: 'Server not found' });
  }
  
  const serverIncidents = db.incidents?.filter(i => i.serverId === req.params.serverId) || [];
  
  const stats = {
    serverId: req.params.serverId,
    serverName: server.name,
    totalMembers: server.memberCount || 0,
    threatsBlocked: serverIncidents.length,
    recentThreats: serverIncidents.slice(0, 5),
    securityLevel: server.securityLevel || 'medium'
  };
  
  res.json(stats);
});

// ==================== THREATS/INCIDENTS ROUTES ====================
app.get('/api/threats', (req, res) => {
  const db = readDB();
  const threats = db.incidents || [];
  res.json(threats);
});

app.get('/api/threats/:serverId', (req, res) => {
  const db = readDB();
  const threats = db.incidents?.filter(i => i.serverId === req.params.serverId) || [];
  res.json(threats);
});

app.post('/api/threats/report', (req, res) => {
  const { serverId, userId, type, description } = req.body;
  
  if (!serverId || !userId || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const db = readDB();
  const incident = {
    id: Date.now().toString(),
    serverId,
    userId,
    type,
    description,
    timestamp: new Date().toISOString(),
    resolved: false
  };
  
  db.incidents = db.incidents || [];
  db.incidents.push(incident);
  
  writeDB(db);
  res.json({ success: true, incident });
});

// ==================== REPORTS ROUTES ====================
app.get('/api/reports', (req, res) => {
  const db = readDB();
  const reports = db.reports || [];
  res.json(reports);
});

app.post('/api/reports/create', (req, res) => {
  const { userId, serverId, reason, evidence } = req.body;
  
  if (!userId || !serverId || !reason) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const db = readDB();
  const report = {
    id: Date.now().toString(),
    userId,
    serverId,
    reason,
    evidence,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };
  
  db.reports = db.reports || [];
  db.reports.push(report);
  
  writeDB(db);
  res.json({ success: true, report });
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ==================== START SERVER ====================
module.exports = {
  startAPI: () => {
    app.listen(API_PORT, () => {
      console.log(`🌐 API Server running on http://23.27.211.92:${API_PORT}`);
    });
  },
  app
};