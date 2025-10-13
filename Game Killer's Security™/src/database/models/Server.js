/**
 * Server Data Model
 * Defines the structure for server-specific settings and data
 */

const { DEFAULT_SETTINGS } = require('../../utils/constants');

class Server {
    constructor(guildId, data = {}) {
        // Basic Info
        this.guildId = guildId;
        this.guildName = data.guildName || null;
        this.joinedAt = data.joinedAt || new Date().toISOString();
        
        // Subscription
        this.tier = data.tier || 'Free';
        this.subscriptionStart = data.subscriptionStart || null;
        this.subscriptionEnd = data.subscriptionEnd || null;
        this.trialUsed = data.trialUsed || false;
        
        // Settings
        this.autoMod = data.autoMod !== undefined ? data.autoMod : DEFAULT_SETTINGS.autoMod;
        this.securityLevel = data.securityLevel || DEFAULT_SETTINGS.securityLevel;
        this.antiSpam = data.antiSpam !== undefined ? data.antiSpam : DEFAULT_SETTINGS.antiSpam;
        this.antiRaid = data.antiRaid !== undefined ? data.antiRaid : DEFAULT_SETTINGS.antiRaid;
        this.linkFilter = data.linkFilter !== undefined ? data.linkFilter : DEFAULT_SETTINGS.linkFilter;
        this.wordFilter = data.wordFilter !== undefined ? data.wordFilter : DEFAULT_SETTINGS.wordFilter;
        this.blockInvites = data.blockInvites !== undefined ? data.blockInvites : false;
        
        // Moderation Settings
        this.maxWarnings = data.maxWarnings || DEFAULT_SETTINGS.maxWarnings;
        this.autoTimeout = data.autoTimeout !== undefined ? data.autoTimeout : DEFAULT_SETTINGS.autoTimeout;
        this.timeoutDuration = data.timeoutDuration || DEFAULT_SETTINGS.timeoutDuration;
        
        // Channels
        this.logChannel = data.logChannel || DEFAULT_SETTINGS.logChannel;
        this.reportChannel = data.reportChannel || DEFAULT_SETTINGS.reportChannel;
        this.welcomeChannel = data.welcomeChannel || DEFAULT_SETTINGS.welcomeChannel;
        this.modChannel = data.modChannel || null;
        
        // Messages
        this.welcomeMessage = data.welcomeMessage || DEFAULT_SETTINGS.welcomeMessage;
        
        // Roles
        this.autoRole = data.autoRole || DEFAULT_SETTINGS.autoRole;
        this.modRole = data.modRole || null;
        this.adminRole = data.adminRole || null;
        
        // Filters
        this.bannedWords = data.bannedWords || [];
        this.allowedLinks = data.allowedLinks || [];
        
        // Reports & Incidents
        this.reports = data.reports || [];
        this.incidents = data.incidents || [];
        
        // Roblox Integration
        this.robloxEnabled = data.robloxEnabled || false;
        this.robloxGameId = data.robloxGameId || null;
        this.banSyncEnabled = data.banSyncEnabled || false;
        this.banSyncLastRun = data.banSyncLastRun || null;
        this.bansSynced = data.bansSynced || 0;
        
        // Statistics
        this.totalWarnings = data.totalWarnings || 0;
        this.totalBans = data.totalBans || 0;
        this.totalKicks = data.totalKicks || 0;
        this.totalTimeouts = data.totalTimeouts || 0;
        this.totalReports = data.totalReports || 0;
        
        // Anti-Raid Tracking
        this.recentJoins = data.recentJoins || [];
        this.raidMode = data.raidMode || false;
        
        // Metadata
        this.lastUpdated = data.lastUpdated || new Date().toISOString();
        this.version = data.version || '2.0.0';
    }

    /**
     * Convert to plain object for database storage
     */
    toJSON() {
        return {
            guildId: this.guildId,
            guildName: this.guildName,
            joinedAt: this.joinedAt,
            tier: this.tier,
            subscriptionStart: this.subscriptionStart,
            subscriptionEnd: this.subscriptionEnd,
            trialUsed: this.trialUsed,
            autoMod: this.autoMod,
            securityLevel: this.securityLevel,
            antiSpam: this.antiSpam,
            antiRaid: this.antiRaid,
            linkFilter: this.linkFilter,
            wordFilter: this.wordFilter,
            blockInvites: this.blockInvites,
            maxWarnings: this.maxWarnings,
            autoTimeout: this.autoTimeout,
            timeoutDuration: this.timeoutDuration,
            logChannel: this.logChannel,
            reportChannel: this.reportChannel,
            welcomeChannel: this.welcomeChannel,
            modChannel: this.modChannel,
            welcomeMessage: this.welcomeMessage,
            autoRole: this.autoRole,
            modRole: this.modRole,
            adminRole: this.adminRole,
            bannedWords: this.bannedWords,
            allowedLinks: this.allowedLinks,
            reports: this.reports,
            incidents: this.incidents,
            robloxEnabled: this.robloxEnabled,
            robloxGameId: this.robloxGameId,
            banSyncEnabled: this.banSyncEnabled,
            banSyncLastRun: this.banSyncLastRun,
            bansSynced: this.bansSynced,
            totalWarnings: this.totalWarnings,
            totalBans: this.totalBans,
            totalKicks: this.totalKicks,
            totalTimeouts: this.totalTimeouts,
            totalReports: this.totalReports,
            recentJoins: this.recentJoins,
            raidMode: this.raidMode,
            lastUpdated: this.lastUpdated,
            version: this.version
        };
    }

    /**
     * Update last updated timestamp
     */
    touch() {
        this.lastUpdated = new Date().toISOString();
    }

    /**
     * Add a report
     */
    addReport(report) {
        this.reports.push(report);
        this.totalReports++;
        this.touch();
    }

    /**
     * Add an incident
     */
    addIncident(incident) {
        this.incidents.push(incident);
        this.touch();
    }

    /**
     * Increment warning count
     */
    incrementWarnings() {
        this.totalWarnings++;
        this.touch();
    }

    /**
     * Increment ban count
     */
    incrementBans() {
        this.totalBans++;
        this.touch();
    }

    /**
     * Increment kick count
     */
    incrementKicks() {
        this.totalKicks++;
        this.touch();
    }

    /**
     * Increment timeout count
     */
    incrementTimeouts() {
        this.totalTimeouts++;
        this.touch();
    }

    /**
     * Check if server has Pro features
     */
    hasPro() {
        return this.tier === 'Pro' || this.tier === 'Enterprise';
    }

    /**
     * Check if server has Enterprise features
     */
    hasEnterprise() {
        return this.tier === 'Enterprise';
    }

    /**
     * Check if subscription is active
     */
    isSubscriptionActive() {
        if (this.tier === 'Free') return true;
        if (!this.subscriptionEnd) return false;
        return new Date(this.subscriptionEnd) > new Date();
    }

    /**
     * Create from plain object
     */
    static fromJSON(data) {
        return new Server(data.guildId, data);
    }
}

module.exports = Server;