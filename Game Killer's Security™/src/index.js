/**
 * Game Killer's Security™ v2.0.0
 * Main Bot Entry Point with Multi-Domain & Multi-Site Support
 */

const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const crypto = require('crypto');
require('dotenv').config();

const logger = require('./src/services/logger');
const db = require('./src/database/db');

// Create Discord client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildPresences
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember
    ]
});

// Initialize collections
client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();
client.selectMenus = new Collection();

/**
 * Generate API key for Roblox plugin
 */
function generateAPIKey(guildId) {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const apiKey = `gks_${guildId}_${timestamp}_${randomBytes}`;

    try {
        const serverData = db.getServer(guildId) || {};
        serverData.robloxAPIKey = apiKey;
        serverData.robloxAPIKeyCreated = new Date().toISOString();
        db.saveServer(guildId, serverData);
        logger.success(`API key generated for guild: ${guildId}`);
    } catch (error) {
        logger.error('Failed to save API key', error);
    }

    return apiKey;
}

/**
 * Validate API key
 */
function validateAPIKey(apiKey) {
    if (!apiKey || apiKey === '') return null;

    try {
        const parts = apiKey.split('_');
        if (parts.length < 3 || parts[0] !== 'gks') return null;

        const guildId = parts[1];
        const serverData = db.getServer(guildId);

        if (!serverData || serverData.robloxAPIKey !== apiKey) return null;

        return guildId;
    } catch (error) {
        logger.error('API key validation failed', error);
        return null;
    }
}

/**
 * Start Web Server & API (multi-domain/multi-site)
 */
function startWebServer() {
    const app = express();
    const PORT = process.env.WEB_PORT || 25974;
    const STUDIOS_PORT = process.env.STUDIOS_PORT || 25808;

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.static(path.join(__dirname, 'src', 'public')));

    // Domain-based routing
    app.use((req, res, next) => {
        const host = req.get('host');
        if (host && host.includes('gamekillerstudios.com')) {
            req.site = 'studios';
        } else {
            req.site = 'security';
        }
        next();
    });

    // Static files and routes
    app.get('/', (req, res) => {
        if (req.site === 'studios') {
            const studiosPath = path.join(__dirname, 'src', 'public', 'studios.html');
            if (fs.existsSync(studiosPath)) return res.sendFile(studiosPath);
        }
        res.sendFile(path.join(__dirname, 'src', 'public', 'index.html'));
    });
    app.use('/studios', express.static(path.join(__dirname, 'src', 'public', 'studios')));

    // ========================
    // PUBLIC API ENDPOINTS
    // ========================
    app.get('/api/stats', (req, res) => {
        try {
            const guilds = client.guilds.cache;
            const totalMembers = guilds.reduce((acc, guild) => acc + guild.memberCount, 0);
            let totalThreats = 0;
            let totalBans = 0;
            let totalGames = 0;

            guilds.forEach(guild => {
                const serverData = db.getServer(guild.id);
                if (serverData) {
                    totalThreats += serverData.totalThreats || 0;
                    totalBans += serverData.totalBans || 0;
                    if (serverData.robloxGames) totalGames += serverData.robloxGames.length;
                }
            });

            res.json({
                discord: {
                    serversProtected: guilds.size,
                    threatsBlocked: totalThreats,
                    totalMembers: totalMembers
                },
                roblox: {
                    gamesProtected: totalGames
                },
                bot: {
                    version: '2.0.0',
                    status: 'online',
                    ping: client.ws.ping,
                    uptime: process.uptime()
                },
                uptime: '99.9%'
            });
        } catch (error) {
            logger.error('API Error:', error);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    });

    app.get('/api/bot/info', (req, res) => {
        try {
            res.json({
                success: true,
                bot: {
                    username: client.user.username,
                    discriminator: client.user.discriminator,
                    id: client.user.id,
                    avatar: client.user.avatarURL(),
                    version: '2.0.0',
                    servers: client.guilds.cache.size
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Failed to fetch bot info' });
        }
    });

    app.get('/api/health', (req, res) => {
        res.json({ status: 'online', uptime: process.uptime(), timestamp: Date.now() });
    });

    // ========================
    // ROBLOX PLUGIN ENDPOINTS
    // ========================
    // Threat report
    app.post('/api/roblox/threat', async (req, res) => {
        try {
            const { userId, username, displayName, threatType, details, timestamp, gameId, gameName, apiKey } = req.body;
            const guildId = validateAPIKey(apiKey);
            if (!guildId) return res.status(401).json({ success: false, error: 'Invalid API key' });

            logger.security('Roblox Threat Detected', { userId, username, threatType, details, gameId, gameName, guildId });

            const threatData = { userId, username, displayName, threatType, details, timestamp: timestamp || Date.now(), gameId, gameName, platform: 'roblox', guildId };
            const serverData = db.getServer(guildId) || {};
            serverData.totalThreats = (serverData.totalThreats || 0) + 1;
            if (!serverData.threatHistory) serverData.threatHistory = [];
            serverData.threatHistory.push(threatData);
            if (serverData.threatHistory.length > 100) serverData.threatHistory = serverData.threatHistory.slice(-100);
            db.saveServer(guildId, serverData);

            res.json({ success: true, message: 'Threat reported successfully', threatId: `threat_${Date.now()}` });
        } catch (error) {
            logger.error('Roblox threat report failed', error);
            res.status(500).json({ success: false, error: 'Failed to report threat' });
        }
    });

    // Ban-status check
    app.post('/api/roblox/ban-status', async (req, res) => {
        try {
            const { userId, username, apiKey } = req.body;
            const guildId = validateAPIKey(apiKey);
            if (!guildId) return res.status(401).json({ success: false, error: 'Invalid API key' });

            const userData = db.getUser(guildId, userId) || {};
            res.json({ success: true, banned: userData.banned || false, reason: userData.banReason || null, userId, username });
        } catch (error) {
            logger.error('Ban status check failed', error);
            res.status(500).json({ success: false, error: 'Failed to check ban status' });
        }
    });

    // Ban-report
    app.post('/api/roblox/ban-report', async (req, res) => {
        try {
            const { userId, username, displayName, reason, timestamp, gameId, apiKey } = req.body;
            const guildId = validateAPIKey(apiKey);
            if (!guildId) return res.status(401).json({ success: false, error: 'Invalid API key' });

            logger.security('Roblox Ban Reported', { userId, username, reason, gameId, guildId });

            const userData = db.getUser(guildId, userId) || {};
            userData.banned = true;
            userData.banReason = reason;
            userData.bannedFrom = 'roblox';
            userData.banTimestamp = timestamp || Date.now();
            db.saveUser(guildId, userId, userData);

            const serverData = db.getServer(guildId) || {};
            serverData.totalBans = (serverData.totalBans || 0) + 1;
            db.saveServer(guildId, serverData);

            res.json({ success: true, message: 'Ban reported successfully' });
        } catch (error) {
            logger.error('Ban report failed', error);
            res.status(500).json({ success: false, error: 'Failed to report ban' });
        }
    });

    // Startup notification
    app.post('/api/roblox/startup', async (req, res) => {
        try {
            const { gameId, gameName, version, timestamp, apiKey } = req.body;
            const guildId = validateAPIKey(apiKey);
            if (!guildId) return res.status(401).json({ success: false, error: 'Invalid API key' });

            logger.info(`Roblox game started: ${gameName} (${gameId}) - v${version} - Guild: ${guildId}`);

            const serverData = db.getServer(guildId) || {};
            if (!serverData.robloxGames) serverData.robloxGames = [];
            const gameExists = serverData.robloxGames.find(g => g.gameId === gameId);
            if (!gameExists) {
                serverData.robloxGames.push({ gameId, gameName, addedDate: new Date().toISOString() });
            }
            serverData.lastRobloxActivity = new Date().toISOString();
            db.saveServer(guildId, serverData);

            res.json({ success: true, message: 'Startup notification received', serverTime: Date.now(), guildId });
        } catch (error) {
            logger.error('Startup notification failed', error);
            res.status(500).json({ success: false, error: 'Failed to process startup' });
        }
    });

    // Command endpoint
    app.post('/api/roblox/command', async (req, res) => {
        try {
            const { command, args, userId, username, gameId, apiKey } = req.body;
            const guildId = validateAPIKey(apiKey);
            if (!guildId) return res.status(401).json({ success: false, error: 'Invalid API key' });

            logger.info(`Roblox command: ${command} by ${username} - Guild: ${guildId}`);

            let response = { success: true, message: '' };

            switch (command) {
                case 'stats':
                    response.message = `📊 Bot Statistics:\n━━━━━━━━━\nServers: ${client.guilds.cache.size}\nUptime: ${Math.floor(process.uptime() / 60)}m\nVersion: 2.0.0\nStatus: ✅ Online`;
                    break;
                case 'ban':
                    if (!args || !args[0]) {
                        response.success = false;
                        response.message = '❌ Usage: /gk ban <username> <reason>';
                    } else {
                        const targetUser = args[0];
                        const reason = args.slice(1).join(' ') || 'No reason provided';
                        const banData = db.getUser(guildId, targetUser) || {};
                        banData.banned = true;
                        banData.banReason = reason;
                        banData.bannedBy = username;
                        banData.banTimestamp = Date.now();
                        db.saveUser(guildId, targetUser, banData);
                        response.message = `✅ Banned ${targetUser}\nReason: ${reason}`;
                    }
                    break;
                case 'unban':
                    if (!args || !args[0]) {
                        response.success = false;
                        response.message = '❌ Usage: /gk unban <username>';
                    } else {
                        const targetUser = args[0];
                        const userData = db.getUser(guildId, targetUser) || {};
                        userData.banned = false;
                        userData.banReason = null;
                        userData.unbannedBy = username;
                        userData.unbanTimestamp = Date.now();
                        db.saveUser(guildId, targetUser, userData);
                        response.message = `✅ Unbanned ${targetUser}`;
                    }
                    break;
                case 'help':
                    response.message = `🛡️ Game Killers Commands\n━━━━━━━━━━━━━━\n/gk stats - Bot stats\n/gk ban <user> - Ban player\n/gk unban <user> - Unban player\n/gk help - This message`;
                    break;
                default:
                    response.success = false;
                    response.message = `❌ Unknown command: ${command}`;
            }

            res.json(response);
        } catch (error) {
            logger.error('Command execution failed', error);
            res.status(500).json({ success: false, error: 'Failed to execute command' });
        }
    });

    // API Key Endpoints
    app.post('/api/roblox/get-api-key', async (req, res) => {
        try {
            const { discordUserId, guildId } = req.body;
            const guild = client.guilds.cache.get(guildId);
            if (!guild) return res.status(404).json({ success: false, error: 'Guild not found' });

            try {
                const member = await guild.members.fetch(discordUserId);
                if (!member.permissions.has('Administrator') && !member.permissions.has('ManageGuild')) {
                    return res.status(403).json({ success: false, error: 'Admin/ManageGuild permission required' });
                }
            } catch {
                return res.status(403).json({ success: false, error: 'You are not a member of this server' });
            }

            const serverData = db.getServer(guildId) || {};
            let apiKey = serverData.robloxAPIKey;
            if (!apiKey) apiKey = generateAPIKey(guildId);

            res.json({ success: true, apiKey, guildId, guildName: guild.name });
        } catch (error) {
            logger.error('API key generation failed', error);
            res.status(500).json({ success: false, error: 'Failed to generate API key' });
        }
    });

    app.post('/api/roblox/reset-api-key', async (req, res) => {
        try {
            const { discordUserId, guildId } = req.body;
            const guild = client.guilds.cache.get(guildId);
            if (!guild) return res.status(404).json({ success: false, error: 'Guild not found' });

            try {
                const member = await guild.members.fetch(discordUserId);
                if (!member.permissions.has('Administrator') && !member.permissions.has('ManageGuild')) {
                    return res.status(403).json({ success: false, error: 'Admin/ManageGuild permission required' });
                }
            } catch {
                return res.status(403).json({ success: false, error: 'You are not a member of this server' });
            }

            const newApiKey = generateAPIKey(guildId);
            res.json({ success: true, apiKey: newApiKey, guildId, guildName: guild.name });
        } catch (error) {
            logger.error('API key reset failed', error);
            res.status(500).json({ success: false, error: 'Failed to reset API key' });
        }
    });

    // Plugin download
    app.get('/downloads/GameKillers_Security_v2.5.3.rbxm', (req, res) => {
        const filePath = path.join(__dirname, 'downloads', 'GameKillers_Security_v2.5.3.rbxm');
        if (fs.existsSync(filePath)) res.download(filePath);
        else {
            logger.warn('Plugin file not found');
            res.status(404).json({ error: 'Plugin file not found. Please contact support.' });
        }
    });

    // 404 handler
    app.use((req, res) => {
        res.status(404).json({ success: false, error: 'Endpoint not found' });
    });

    // Start server
    app.listen(PORT, () => {
        logger.success(`🌐 Bot Server running on port ${PORT}`);
        logger.info(`🔗 Bot: https://212.192.28.36:${PORT}`);
        logger.info(`🔗 Security Bot Site: www.gamekillersecuritybot.com`);
    });

    logger.info(`📌 Studios Server: https://212.192.28.36:${STUDIOS_PORT}`);
    logger.info(`📌 Studios Site: www.gamekillerstudios.com`);
}

/**
 * Load commands
 */
function loadCommands() {
    const commandsPath = path.join(__dirname, 'src', 'commands');

    function loadFromDir(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) loadFromDir(filePath);
            else if (file.endsWith('.js')) {
                try {
                    const command = require(filePath);
                    if ('data' in command && 'execute' in command) {
                        client.commands.set(command.data.name, command);
                        logger.success(`Loaded command: ${command.data.name}`);
                    }
                } catch (error) {
                    logger.error(`Failed to load command ${file}`, error);
                }
            }
        }
    }

    loadFromDir(commandsPath);
    logger.info(`Loaded ${client.commands.size} 'src', commands`);
}

/**
 * Load events
 */
function loadEvents() {
    const eventsPath = path.join(__dirname,'src', 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        try {
            const event = require(path.join(eventsPath, file));
            if (event.once) client.once(event.name, (...args) => event.execute(...args));
            else client.on(event.name, (...args) => event.execute(...args));
            logger.success(`Loaded event: ${event.name}`);
        } catch (error) {
            logger.error(`Failed to load event ${file}`, error);
        }
    }

    logger.info(`Loaded ${eventFiles.length} events`);
}

/**
 * Load buttons, modals, select menus
 */
function loadButtons() {
    const buttonsPath = path.join(__dirname, 'src', 'components/buttons');
    if (!fs.existsSync(buttonsPath)) return logger.warn('Buttons directory not found');

    const buttonFiles = fs.readdirSync(buttonsPath).filter(f => f.endsWith('.js'));
    for (const file of buttonFiles) {
        try {
            const button = require(path.join(buttonsPath, file));
            if ('name' in button && 'execute' in button) client.buttons.set(button.name, button);
            logger.success(`Loaded button handler: ${button.name}`);
        } catch (error) {
            logger.error(`Failed to load button ${file}`, error);
        }
    }
    logger.info(`Loaded ${client.buttons.size} button handlers`);
}

function loadModals() {
    const modalsPath = path.join(__dirname, 'src', 'components/modals');
    if (!fs.existsSync(modalsPath)) return logger.warn('Modals directory not found');

    const modalFiles = fs.readdirSync(modalsPath).filter(f => f.endsWith('.js'));
    for (const file of modalFiles) {
        try {
            const modal = require(path.join(modalsPath, file));
            if ('name' in modal && 'execute' in modal) client.modals.set(modal.name, modal);
            logger.success(`Loaded modal handler: ${modal.name}`);
        } catch (error) {
            logger.error(`Failed to load modal ${file}`, error);
        }
    }
    logger.info(`Loaded ${client.modals.size} modal handlers`);
}

function loadSelectMenus() {
    const menusPath = path.join(__dirname, 'src', 'components/selectMenus');
    if (!fs.existsSync(menusPath)) return logger.warn('Select menus directory not found');

    const menuFiles = fs.readdirSync(menusPath).filter(f => f.endsWith('.js'));
    for (const file of menuFiles) {
        try {
            const menu = require(path.join(menusPath, file));
            if ('name' in menu && 'execute' in menu) client.selectMenus.set(menu.name, menu);
            logger.success(`Loaded select menu handler: ${menu.name}`);
        } catch (error) {
            logger.error(`Failed to load select menu ${file}`, error);
        }
    }
    logger.info(`Loaded ${client.selectMenus.size} select menu handlers`);
}

/**
 * Bot ready
 */
client.on('ready', () => {
    logger.success(`Bot logged in as: ${client.user.tag}`);
    startWebServer();
});

/**
 * Error handling
 */
process.on('unhandledRejection', (error) => logger.error('Unhandled Promise Rejection', error));
process.on('uncaughtException', (error) => { logger.error('Uncaught Exception', error); process.exit(1); });
process.on('SIGINT', () => { logger.system('Shutting down...'); client.destroy(); process.exit(0); });
process.on('SIGTERM', () => { logger.system('Received SIGTERM signal, shutting down...'); client.destroy(); process.exit(0); });

/**
 * Initialize bot
 */
async function initialize() {
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.cyan('🛡️ Game Killer\'s Security™ v2.0.0'));
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log();

    if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
        logger.error('Missing DISCORD_TOKEN or CLIENT_ID in .env file!');
        process.exit(1);
    }

    logger.system('Initializing bot...');
    console.log();

    try {
        db.initialize();
        logger.success('Database initialized');
    } catch (error) {
        logger.error('Failed to initialize database', error);
        process.exit(1);
    }

    ['src/downloads', 'src/public', 'src/public/studios'].forEach(dir => {
        const dirPath = path.join(__dirname, dir);
        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
        logger.success(`Created directory: ${dir}`);
    });

    console.log();
    logger.info('Loading commands...');
    loadCommands();
    console.log();
    logger.info('Loading events...');
    loadEvents();
    console.log();
    logger.info('Loading button handlers...');
    loadButtons();
    console.log();
    logger.info('Loading modal handlers...');
    loadModals();
    console.log();
    logger.info('Loading select menu handlers...');
    loadSelectMenus();
    console.log();
    logger.info('Connecting to Discord...');

    try {
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        logger.error('Failed to login to Discord', error);
        process.exit(1);
    }
}

initialize();
module.exports = client;
