/**
 * User Data Model
 * Defines the structure for user-specific data within a guild
 */

class User {
    constructor(userId, guildId, data = {}) {
        // Basic Info
        this.userId = userId;
        this.guildId = guildId;
        this.username = data.username || null;
        this.joinedAt = data.joinedAt || new Date().toISOString();
        
        // Moderation Data
        this.warnings = data.warnings || [];
        this.bans = data.bans || [];
        this.kicks = data.kicks || [];
        this.timeouts = data.timeouts || [];
        this.infractions = data.infractions || 0;
        
        // Flags & Status
        this.flags = data.flags || [];
        this.notes = data.notes || [];
        this.isMuted = data.isMuted || false;
        this.isBanned = data.isBanned || false;
        
        // Auto-Moderation
        this.autoModViolations = data.autoModViolations || 0;
        this.recentMessages = data.recentMessages || [];
        this.lastSpamTimestamp = data.lastSpamTimestamp || null;
        
        // Roblox Integration
        this.robloxLinked = data.robloxLinked || false;
        this.robloxUserId = data.robloxUserId || null;
        this.robloxUsername = data.robloxUsername || null;
        this.robloxLinkedDate = data.robloxLinkedDate || null;
        this.robloxVerified = data.robloxVerified || false;
        this.pendingVerification = data.pendingVerification || null;
        
        // Reports
        this.reportsMade = data.reportsMade || [];
        this.reportsReceived = data.reportsReceived || [];
        
        // Statistics
        this.totalMessages = data.totalMessages || 0;
        this.lastMessageTimestamp = data.lastMessageTimestamp || null;
        this.lastActive = data.lastActive || new Date().toISOString();
        
        // Metadata
        this.createdAt = data.createdAt || new Date().toISOString();
        this.lastUpdated = data.lastUpdated || new Date().toISOString();
    }

    /**
     * Convert to plain object for database storage
     */
    toJSON() {
        return {
            userId: this.userId,
            guildId: this.guildId,
            username: this.username,
            joinedAt: this.joinedAt,
            warnings: this.warnings,
            bans: this.bans,
            kicks: this.kicks,
            timeouts: this.timeouts,
            infractions: this.infractions,
            flags: this.flags,
            notes: this.notes,
            isMuted: this.isMuted,
            isBanned: this.isBanned,
            autoModViolations: this.autoModViolations,
            recentMessages: this.recentMessages,
            lastSpamTimestamp: this.lastSpamTimestamp,
            robloxLinked: this.robloxLinked,
            robloxUserId: this.robloxUserId,
            robloxUsername: this.robloxUsername,
            robloxLinkedDate: this.robloxLinkedDate,
            robloxVerified: this.robloxVerified,
            pendingVerification: this.pendingVerification,
            reportsMade: this.reportsMade,
            reportsReceived: this.reportsReceived,
            totalMessages: this.totalMessages,
            lastMessageTimestamp: this.lastMessageTimestamp,
            lastActive: this.lastActive,
            createdAt: this.createdAt,
            lastUpdated: this.lastUpdated
        };
    }

    /**
     * Update last updated timestamp
     */
    touch() {
        this.lastUpdated = new Date().toISOString();
        this.lastActive = new Date().toISOString();
    }

    /**
     * Add a warning
     */
    addWarning(warning) {
        this.warnings.push(warning);
        this.infractions++;
        this.touch();
    }

    /**
     * Remove a warning by ID
     */
    removeWarning(warningId) {
        const index = this.warnings.findIndex(w => w.id === warningId);
        if (index !== -1) {
            this.warnings.splice(index, 1);
            this.infractions = Math.max(0, this.infractions - 1);
            this.touch();
            return true;
        }
        return false;
    }

    /**
     * Clear all warnings
     */
    clearWarnings() {
        const count = this.warnings.length;
        this.warnings = [];
        this.infractions = Math.max(0, this.infractions - count);
        this.touch();
        return count;
    }

    /**
     * Add a ban record
     */
    addBan(ban) {
        this.bans.push(ban);
        this.isBanned = true;
        this.infractions++;
        this.touch();
    }

    /**
     * Add a kick record
     */
    addKick(kick) {
        this.kicks.push(kick);
        this.infractions++;
        this.touch();
    }

    /**
     * Add a timeout record
     */
    addTimeout(timeout) {
        this.timeouts.push(timeout);
        this.infractions++;
        this.touch();
    }

    /**
     * Add a flag
     */
    addFlag(flag) {
        if (!this.flags.includes(flag)) {
            this.flags.push(flag);
            this.touch();
        }
    }

    /**
     * Remove a flag
     */
    removeFlag(flag) {
        const index = this.flags.indexOf(flag);
        if (index !== -1) {
            this.flags.splice(index, 1);
            this.touch();
            return true;
        }
        return false;
    }

    /**
     * Add a note
     */
    addNote(note) {
        this.notes.push({
            id: Date.now().toString(),
            content: note,
            timestamp: new Date().toISOString()
        });
        this.touch();
    }

    /**
     * Link Roblox account
     */
    linkRoblox(robloxUserId, robloxUsername) {
        this.robloxLinked = true;
        this.robloxUserId = robloxUserId;
        this.robloxUsername = robloxUsername;
        this.robloxLinkedDate = new Date().toISOString();
        this.robloxVerified = true;
        this.pendingVerification = null;
        this.touch();
    }

    /**
     * Unlink Roblox account
     */
    unlinkRoblox() {
        this.robloxLinked = false;
        this.robloxUserId = null;
        this.robloxUsername = null;
        this.robloxLinkedDate = null;
        this.robloxVerified = false;
        this.touch();
    }

    /**
     * Add report made by this user
     */
    addReportMade(reportId) {
        this.reportsMade.push(reportId);
        this.touch();
    }

    /**
     * Add report received by this user
     */
    addReportReceived(reportId) {
        this.reportsReceived.push(reportId);
        this.touch();
    }

    /**
     * Increment message count
     */
    incrementMessages() {
        this.totalMessages++;
        this.lastMessageTimestamp = Date.now();
        this.touch();
    }

    /**
     * Track recent message for spam detection
     */
    trackMessage(timestamp) {
        this.recentMessages.push(timestamp);
        this.incrementMessages();
    }

    /**
     * Get risk level based on infractions
     */
    getRiskLevel() {
        if (this.infractions >= 5) return 'HIGH';
        if (this.infractions >= 3) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * Get risk color
     */
    getRiskColor() {
        const level = this.getRiskLevel();
        if (level === 'HIGH') return '#ff0000';
        if (level === 'MEDIUM') return '#ffff00';
        return '#00ff00';
    }

    /**
     * Get risk emoji
     */
    getRiskEmoji() {
        const level = this.getRiskLevel();
        if (level === 'HIGH') return '🔴';
        if (level === 'MEDIUM') return '🟡';
        return '🟢';
    }

    /**
     * Check if user has specific flag
     */
    hasFlag(flag) {
        return this.flags.includes(flag);
    }

    /**
     * Get active warnings (not expired)
     */
    getActiveWarnings() {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        return this.warnings.filter(w => {
            const warningTime = new Date(w.timestamp).getTime();
            return warningTime > thirtyDaysAgo;
        });
    }

    /**
     * Create from plain object
     */
    static fromJSON(data) {
        return new User(data.userId, data.guildId, data);
    }
}

module.exports = User;