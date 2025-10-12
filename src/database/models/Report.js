/**
 * Report Data Model
 * Defines the structure for user reports
 */

class Report {
    constructor(data = {}) {
        // Basic Info
        this.id = data.id || Date.now().toString();
        this.guildId = data.guildId;
        
        // Report Details
        this.reportedUser = data.reportedUser;
        this.reportedUsername = data.reportedUsername || null;
        this.reporter = data.reporter;
        this.reporterUsername = data.reporterUsername || null;
        
        // Content
        this.reason = data.reason;
        this.evidence = data.evidence || 'No evidence provided';
        this.additionalInfo = data.additionalInfo || null;
        this.category = data.category || 'other'; // 'harassment', 'spam', 'toxicity', 'cheating', 'other'
        
        // Status
        this.status = data.status || 'pending'; // 'pending', 'approved', 'denied', 'investigating'
        this.priority = data.priority || 'normal'; // 'low', 'normal', 'high', 'urgent'
        
        // Review
        this.reviewedBy = data.reviewedBy || null;
        this.reviewedByUsername = data.reviewedByUsername || null;
        this.reviewedAt = data.reviewedAt || null;
        this.reviewNotes = data.reviewNotes || null;
        this.actionTaken = data.actionTaken || null;
        
        // Timestamps
        this.timestamp = data.timestamp || new Date().toISOString();
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        
        // Related Data
        this.incidentId = data.incidentId || null;
        this.relatedReports = data.relatedReports || [];
        
        // Metadata
        this.attachments = data.attachments || [];
        this.messageLink = data.messageLink || null;
        this.channelId = data.channelId || null;
        this.flags = data.flags || [];
        this.tags = data.tags || [];
    }

    /**
     * Convert to plain object for database storage
     */
    toJSON() {
        return {
            id: this.id,
            guildId: this.guildId,
            reportedUser: this.reportedUser,
            reportedUsername: this.reportedUsername,
            reporter: this.reporter,
            reporterUsername: this.reporterUsername,
            reason: this.reason,
            evidence: this.evidence,
            additionalInfo: this.additionalInfo,
            category: this.category,
            status: this.status,
            priority: this.priority,
            reviewedBy: this.reviewedBy,
            reviewedByUsername: this.reviewedByUsername,
            reviewedAt: this.reviewedAt,
            reviewNotes: this.reviewNotes,
            actionTaken: this.actionTaken,
            timestamp: this.timestamp,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            incidentId: this.incidentId,
            relatedReports: this.relatedReports,
            attachments: this.attachments,
            messageLink: this.messageLink,
            channelId: this.channelId,
            flags: this.flags,
            tags: this.tags
        };
    }

    /**
     * Update timestamp
     */
    touch() {
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Approve report
     */
    approve(reviewerId, reviewerUsername, notes = null) {
        this.status = 'approved';
        this.reviewedBy = reviewerId;
        this.reviewedByUsername = reviewerUsername;
        this.reviewedAt = new Date().toISOString();
        this.reviewNotes = notes;
        this.touch();
    }

    /**
     * Deny report
     */
    deny(reviewerId, reviewerUsername, notes = null) {
        this.status = 'denied';
        this.reviewedBy = reviewerId;
        this.reviewedByUsername = reviewerUsername;
        this.reviewedAt = new Date().toISOString();
        this.reviewNotes = notes;
        this.touch();
    }

    /**
     * Set to investigating
     */
    setInvestigating(reviewerId, reviewerUsername) {
        this.status = 'investigating';
        this.reviewedBy = reviewerId;
        this.reviewedByUsername = reviewerUsername;
        this.touch();
    }

    /**
     * Set action taken
     */
    setActionTaken(action) {
        this.actionTaken = action;
        this.touch();
    }

    /**
     * Set priority
     */
    setPriority(priority) {
        this.priority = priority;
        this.touch();
    }

    /**
     * Add attachment
     */
    addAttachment(attachment) {
        this.attachments.push({
            type: attachment.type || 'link',
            url: attachment.url,
            description: attachment.description || null,
            timestamp: new Date().toISOString()
        });
        this.touch();
    }

    /**
     * Add flag
     */
    addFlag(flag) {
        if (!this.flags.includes(flag)) {
            this.flags.push(flag);
            this.touch();
        }
    }

    /**
     * Remove flag
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
     * Add tag
     */
    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
            this.touch();
        }
    }

    /**
     * Link related report
     */
    linkReport(reportId) {
        if (!this.relatedReports.includes(reportId)) {
            this.relatedReports.push(reportId);
            this.touch();
        }
    }

    /**
     * Link to incident
     */
    linkIncident(incidentId) {
        this.incidentId = incidentId;
        this.touch();
    }

    /**
     * Get status color
     */
    getStatusColor() {
        const colors = {
            pending: '#ffff00',
            approved: '#00ff00',
            denied: '#ff0000',
            investigating: '#00d9ff'
        };
        return colors[this.status] || colors.pending;
    }

    /**
     * Get status emoji
     */
    getStatusEmoji() {
        const emojis = {
            pending: '🟡',
            approved: '✅',
            denied: '❌',
            investigating: '🔍'
        };
        return emojis[this.status] || emojis.pending;
    }

    /**
     * Get priority color
     */
    getPriorityColor() {
        const colors = {
            low: '#808080',
            normal: '#00d9ff',
            high: '#ff9900',
            urgent: '#ff0000'
        };
        return colors[this.priority] || colors.normal;
    }

    /**
     * Get priority emoji
     */
    getPriorityEmoji() {
        const emojis = {
            low: '⬇️',
            normal: '➡️',
            high: '⬆️',
            urgent: '🔥'
        };
        return emojis[this.priority] || emojis.normal;
    }

    /**
     * Get category emoji
     */
    getCategoryEmoji() {
        const emojis = {
            harassment: '😡',
            spam: '📢',
            toxicity: '☠️',
            cheating: '🎮',
            other: '📋'
        };
        return emojis[this.category] || emojis.other;
    }

    /**
     * Check if report is pending
     */
    isPending() {
        return this.status === 'pending';
    }

    /**
     * Check if report is resolved
     */
    isResolved() {
        return this.status === 'approved' || this.status === 'denied';
    }

    /**
     * Get age in hours
     */
    getAgeHours() {
        const created = new Date(this.createdAt);
        const now = new Date();
        const diff = now - created;
        return Math.floor(diff / (1000 * 60 * 60));
    }

    /**
     * Get age in days
     */
    getAgeDays() {
        return Math.floor(this.getAgeHours() / 24);
    }

    /**
     * Check if report is old (more than 7 days)
     */
    isOld() {
        return this.getAgeDays() > 7;
    }

    /**
     * Create from plain object
     */
    static fromJSON(data) {
        return new Report(data);
    }

    /**
     * Create harassment report
     */
    static createHarassment(guildId, reportedUser, reporter, reason, evidence) {
        return new Report({
            guildId,
            reportedUser,
            reporter,
            reason,
            evidence,
            category: 'harassment',
            priority: 'high'
        });
    }

    /**
     * Create spam report
     */
    static createSpam(guildId, reportedUser, reporter, reason, evidence) {
        return new Report({
            guildId,
            reportedUser,
            reporter,
            reason,
            evidence,
            category: 'spam',
            priority: 'normal'
        });
    }

    /**
     * Create toxicity report
     */
    static createToxicity(guildId, reportedUser, reporter, reason, evidence) {
        return new Report({
            guildId,
            reportedUser,
            reporter,
            reason,
            evidence,
            category: 'toxicity',
            priority: 'high'
        });
    }

    /**
     * Create cheating report
     */
    static createCheating(guildId, reportedUser, reporter, reason, evidence) {
        return new Report({
            guildId,
            reportedUser,
            reporter,
            reason,
            evidence,
            category: 'cheating',
            priority: 'high'
        });
    }
}

module.exports = Report;