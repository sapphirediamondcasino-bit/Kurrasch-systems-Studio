/**
 * Incident Data Model
 * Defines the structure for security incidents and moderation actions
 */

class Incident {
    constructor(data = {}) {
        // Basic Info
        this.id = data.id || Date.now().toString();
        this.guildId = data.guildId;
        this.type = data.type; // 'warning', 'ban', 'kick', 'timeout', 'automod', 'raid', 'spam', 'other'
        
        // Users Involved
        this.targetUserId = data.targetUserId;
        this.targetUsername = data.targetUsername || null;
        this.moderatorId = data.moderatorId || null;
        this.moderatorUsername = data.moderatorUsername || null;
        
        // Incident Details
        this.reason = data.reason;
        this.description = data.description || null;
        this.severity = data.severity || 'medium'; // 'low', 'medium', 'high', 'critical'
        this.status = data.status || 'open'; // 'open', 'investigating', 'resolved', 'dismissed'
        
        // Action Taken
        this.action = data.action || null; // Specific action taken
        this.actionDetails = data.actionDetails || {};
        this.automated = data.automated || false;
        
        // Evidence & Context
        this.evidence = data.evidence || [];
        this.messageContent = data.messageContent || null;
        this.channelId = data.channelId || null;
        this.attachments = data.attachments || [];
        
        // Related Data
        this.relatedIncidents = data.relatedIncidents || [];
        this.reportId = data.reportId || null;
        
        // Timestamps
        this.timestamp = data.timestamp || new Date().toISOString();
        this.resolvedAt = data.resolvedAt || null;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        
        // Notes & Follow-up
        this.notes = data.notes || [];
        this.followUpRequired = data.followUpRequired || false;
        this.followUpDate = data.followUpDate || null;
        
        // Metadata
        this.tags = data.tags || [];
        this.flags = data.flags || [];
    }

    /**
     * Convert to plain object for database storage
     */
    toJSON() {
        return {
            id: this.id,
            guildId: this.guildId,
            type: this.type,
            targetUserId: this.targetUserId,
            targetUsername: this.targetUsername,
            moderatorId: this.moderatorId,
            moderatorUsername: this.moderatorUsername,
            reason: this.reason,
            description: this.description,
            severity: this.severity,
            status: this.status,
            action: this.action,
            actionDetails: this.actionDetails,
            automated: this.automated,
            evidence: this.evidence,
            messageContent: this.messageContent,
            channelId: this.channelId,
            attachments: this.attachments,
            relatedIncidents: this.relatedIncidents,
            reportId: this.reportId,
            timestamp: this.timestamp,
            resolvedAt: this.resolvedAt,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            notes: this.notes,
            followUpRequired: this.followUpRequired,
            followUpDate: this.followUpDate,
            tags: this.tags,
            flags: this.flags
        };
    }

    /**
     * Update timestamp
     */
    touch() {
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Add evidence
     */
    addEvidence(evidence) {
        this.evidence.push({
            type: evidence.type || 'text',
            content: evidence.content,
            timestamp: new Date().toISOString()
        });
        this.touch();
    }

    /**
     * Add note
     */
    addNote(note, authorId) {
        this.notes.push({
            id: Date.now().toString(),
            content: note,
            authorId: authorId,
            timestamp: new Date().toISOString()
        });
        this.touch();
    }

    /**
     * Update status
     */
    updateStatus(newStatus) {
        this.status = newStatus;
        
        if (newStatus === 'resolved') {
            this.resolvedAt = new Date().toISOString();
            this.followUpRequired = false;
        }
        
        this.touch();
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
     * Remove tag
     */
    removeTag(tag) {
        const index = this.tags.indexOf(tag);
        if (index !== -1) {
            this.tags.splice(index, 1);
            this.touch();
            return true;
        }
        return false;
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
     * Link to another incident
     */
    linkIncident(incidentId) {
        if (!this.relatedIncidents.includes(incidentId)) {
            this.relatedIncidents.push(incidentId);
            this.touch();
        }
    }

    /**
     * Set follow-up
     */
    setFollowUp(date) {
        this.followUpRequired = true;
        this.followUpDate = date;
        this.touch();
    }

    /**
     * Clear follow-up
     */
    clearFollowUp() {
        this.followUpRequired = false;
        this.followUpDate = null;
        this.touch();
    }

    /**
     * Get severity color
     */
    getSeverityColor() {
        const colors = {
            low: '#00ff00',
            medium: '#ffff00',
            high: '#ff9900',
            critical: '#ff0000'
        };
        return colors[this.severity] || colors.medium;
    }

    /**
     * Get severity emoji
     */
    getSeverityEmoji() {
        const emojis = {
            low: '🟢',
            medium: '🟡',
            high: '🟠',
            critical: '🔴'
        };
        return emojis[this.severity] || emojis.medium;
    }

    /**
     * Get type emoji
     */
    getTypeEmoji() {
        const emojis = {
            warning: '⚠️',
            ban: '🔨',
            kick: '👢',
            timeout: '⏰',
            automod: '🤖',
            raid: '🚨',
            spam: '📢',
            other: '📋'
        };
        return emojis[this.type] || emojis.other;
    }

    /**
     * Check if incident is resolved
     */
    isResolved() {
        return this.status === 'resolved';
    }

    /**
     * Check if incident requires follow-up
     */
    needsFollowUp() {
        if (!this.followUpRequired) return false;
        if (!this.followUpDate) return true;
        return new Date(this.followUpDate) <= new Date();
    }

    /**
     * Get age in days
     */
    getAgeDays() {
        const created = new Date(this.createdAt);
        const now = new Date();
        const diff = now - created;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    /**
     * Create from plain object
     */
    static fromJSON(data) {
        return new Incident(data);
    }

    /**
     * Create warning incident
     */
    static createWarning(guildId, targetUserId, moderatorId, reason) {
        return new Incident({
            guildId,
            type: 'warning',
            targetUserId,
            moderatorId,
            reason,
            severity: 'low',
            action: 'User warned'
        });
    }

    /**
     * Create ban incident
     */
    static createBan(guildId, targetUserId, moderatorId, reason) {
        return new Incident({
            guildId,
            type: 'ban',
            targetUserId,
            moderatorId,
            reason,
            severity: 'high',
            action: 'User banned'
        });
    }

    /**
     * Create kick incident
     */
    static createKick(guildId, targetUserId, moderatorId, reason) {
        return new Incident({
            guildId,
            type: 'kick',
            targetUserId,
            moderatorId,
            reason,
            severity: 'medium',
            action: 'User kicked'
        });
    }

    /**
     * Create timeout incident
     */
    static createTimeout(guildId, targetUserId, moderatorId, reason, duration) {
        return new Incident({
            guildId,
            type: 'timeout',
            targetUserId,
            moderatorId,
            reason,
            severity: 'low',
            action: 'User timed out',
            actionDetails: { duration }
        });
    }

    /**
     * Create automod incident
     */
    static createAutoMod(guildId, targetUserId, reason, violations) {
        return new Incident({
            guildId,
            type: 'automod',
            targetUserId,
            reason,
            severity: 'low',
            automated: true,
            action: 'Auto-moderation triggered',
            actionDetails: { violations }
        });
    }
}

module.exports = Incident;