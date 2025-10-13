// Game Killers Studio - Datastore Utility
// Complete JSON-based database management system

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../datastore');

// Ensure datastore directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Initialize all datastore files
async function initializeDatastore() {
  await ensureDataDir();

  const files = {
    'users.json': [],
    'posts.json': [],
    'friends.json': [],
    'followers.json': [],
    'subscriptions.json': [],
    'badges.json': [],
    'games.json': [],
    'conversions.json': [],
    'aiLogs.json': [],
    'movieNights.json': [],
    'teamBuilder.json': [],
    'buildBattles.json': [],
    'ideaVault.json': [],
    'projectHub.json': [],
    'goalTracker.json': [],
    'miniArcade.json': [],
    'marketplace.json': [],
    'notifications.json': [],
    'xpLeaderboard.json': [],
    'chatRooms.json': [],
    'messages.json': [],
  };

  for (const [filename, defaultData] of Object.entries(files)) {
    const filepath = path.join(DATA_DIR, filename);
    try {
      await fs.access(filepath);
    } catch {
      await fs.writeFile(filepath, JSON.stringify(defaultData, null, 2));
      console.log(`Created ${filename}`);
    }
  }

  console.log('Datastore initialized successfully');
}

// Read data from file
async function readData(filename) {
  try {
    const filepath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filepath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

// Write data to file
async function writeData(filename, data) {
  try {
    const filepath = path.join(DATA_DIR, filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

// Generic CRUD operations
class Datastore {
  constructor(filename) {
    this.filename = filename;
  }

  async getAll() {
    return await readData(this.filename);
  }

  async getById(id) {
    const data = await this.getAll();
    return data.find(item => item.id === id);
  }

  async create(item) {
    const data = await this.getAll();
    const newItem = {
      id: uuidv4(),
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.push(newItem);
    await writeData(this.filename, data);
    return newItem;
  }

  async update(id, updates) {
    const data = await this.getAll();
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return null;

    data[index] = {
      ...data[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await writeData(this.filename, data);
    return data[index];
  }

  async delete(id) {
    const data = await this.getAll();
    const filtered = data.filter(item => item.id !== id);
    if (filtered.length === data.length) return false;
    await writeData(this.filename, filtered);
    return true;
  }

  async find(query) {
    const data = await this.getAll();
    return data.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  async findOne(query) {
    const results = await this.find(query);
    return results[0] || null;
  }

  async count() {
    const data = await this.getAll();
    return data.length;
  }

  async exists(id) {
    const item = await this.getById(id);
    return !!item;
  }
}

// Datastore instances for each collection
const users = new Datastore('users.json');
const posts = new Datastore('posts.json');
const friends = new Datastore('friends.json');
const followers = new Datastore('followers.json');
const subscriptions = new Datastore('subscriptions.json');
const badges = new Datastore('badges.json');
const games = new Datastore('games.json');
const conversions = new Datastore('conversions.json');
const aiLogs = new Datastore('aiLogs.json');
const movieNights = new Datastore('movieNights.json');
const teamBuilder = new Datastore('teamBuilder.json');
const buildBattles = new Datastore('buildBattles.json');
const ideaVault = new Datastore('ideaVault.json');
const projectHub = new Datastore('projectHub.json');
const goalTracker = new Datastore('goalTracker.json');
const miniArcade = new Datastore('miniArcade.json');
const marketplace = new Datastore('marketplace.json');
const notifications = new Datastore('notifications.json');
const xpLeaderboard = new Datastore('xpLeaderboard.json');
const chatRooms = new Datastore('chatRooms.json');
const messages = new Datastore('messages.json');

module.exports = {
  initializeDatastore,
  readData,
  writeData,
  Datastore,
  users,
  posts,
  friends,
  followers,
  subscriptions,
  badges,
  games,
  conversions,
  aiLogs,
  movieNights,
  teamBuilder,
  buildBattles,
  ideaVault,
  projectHub,
  goalTracker,
  miniArcade,
  marketplace,
  notifications,
  xpLeaderboard,
  chatRooms,
  messages,
};