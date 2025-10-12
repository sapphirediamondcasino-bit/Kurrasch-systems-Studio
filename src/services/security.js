/**
 * Security Service
 * Security scanning and threat detection logic
 */

const db = require('../database/db');
const { PATTERNS, AUTO_MOD } = require('../utils/constants');

class SecurityService {
    /**
     * Scan message for threats
     */
    static scanMessage(message, serverData) {
        const threats = [];
        const content = message.content;

        // Check for spam patterns
        if (this.detectSpam(content)) {
            threats.push({ type: 'spam', severity: 'medium', description: 'Spam detected' });
        }

        // Check for excessive caps
        if (this.detectExcessiveCaps(content)) {
            threats.push({ type: 'caps', severity: 'low', description: 'Excessive caps' });
        }

        // Check for Discord invites
        if (serverData.blockInvites && this.detectDiscordInvite(content)) {
            threats.push({ type: 'invite', severity: 'medium', description: 'Discord invite link' });
        }

        // Check for malicious links
        if (this.detectMaliciousLinks(content, serverData)) {
            threats.push({ type: 'malicious_link', severity: 'high', description: 'Malicious link detected' });
        }

        // Check for banned words
        if (serverData.wordFilter && this.detectBannedWords(content, serverData)) {
            threats.push({ type: 'banned_word', severity: 'high', description: 'Banned word detected' });
        }

        // Check for excessive mentions
        if (this.detectExcessiveMentions(message)) {
            threats.push({ type: 'mentions', severity: 'medium', description: 'Excessive mentions' });
        }

        // Check for excessive emojis
        if (this.detectExcessiveEmojis(content)) {
            threats.push({ type: 'emojis', severity: 'low', description: 'Excessive emojis' });
        }

        return threats;
    }

    /**
     * Detect spam patterns
     */
    static detectSpam(content) {
        // Check for repeated characters
        const repeatedChars = /(.)\1{10,}/g;
        if (repeatedChars.test(content)) return true;

        // Check for repeated words
        const words = content.toLowerCase().split(/\s+/);
        const wordCounts = {};
        
        for (const word of words) {
            if (word.length > 2) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
                if (wordCounts[word] >= AUTO_MOD.REPEAT_THRESHOLD) return true;
            }
        }

        return false;
    }

    /**
     * Detect excessive caps
     */
    static detectExcessiveCaps(content) {
        if (content.length < 10) return false;

        const capsCount = (content.match(/[A-Z]/g) || []).length;
        const totalLetters = (content.match(/[a-zA-Z]/g) || []).length;

        if (totalLetters === 0) return false;

        const capsPercentage = (capsCount / totalLetters) * 100;
        return capsPercentage > AUTO_MOD.CAPS_PERCENTAGE;
    }

    /**
     * Detect Discord invites
     */
    static detectDiscordInvite(content) {
        return PATTERNS.DISCORD_INVITE.test(content);
    }

    /**
     * Detect malicious links
     */
    static detectMaliciousLinks(content, serverData) {
        const urls = content.match(PATTERNS.URL) || [];
        
        if (urls.length === 0) return false;

        // Check if link filtering is enabled
        if (!serverData.linkFilter) return false;

        // Check against allowed links
        if (serverData.allowedLinks && serverData.allowedLinks.length > 0) {
            for (const url of urls) {
                let isAllowed = false;
                
                for (const allowed of serverData.allowedLinks) {
                    if (url.toLowerCase().includes(allowed.toLowerCase())) {
                        isAllowed = true;
                        break;
                    }
                }
                
                if (!isAllowed) return true;
            }
        }

        // Check for too many links
        if (urls.length > AUTO_MOD.MAX_LINKS) return true;

        return false;
    }

    /**
     * Detect banned words
     */
    static detectBannedWords(content, serverData) {
        if (!serverData.bannedWords || serverData.bannedWords.length === 0) return false;

        const lowerContent = content.toLowerCase();

        for (const word of serverData.bannedWords) {
            if (lowerContent.includes(word.toLowerCase())) {
                return true;
            }
        }

        return false;
    }

    /**
     * Detect excessive mentions
     */
    static detectExcessiveMentions(message) {
        const mentions = message.mentions.users.size + message.mentions.roles.size;
        return mentions > AUTO_MOD.MAX_MENTIONS;
    }

    /**
     * Detect excessive emojis
     */
    static detectExcessiveEmojis(content) {
        const customEmojis = (content.match(PATTERNS.EMOJI) || []).length;
        const unicodeEmojis = (content.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
        
        const totalEmojis = customEmojis + unicodeEmojis;
        return totalEmojis > AUTO_MOD.MAX_EMOJIS;
    }

    /**
     * Calculate user risk score
     */
    static calculateRiskScore(userData) {
        let score = 0;

        // Base score on infractions
        score += (userData.infractions || 0) * 10;

        // Add points for warnings
        score += (userData.warnings?.length || 0) * 5;

        // Add points for auto-mod violations
        score += (userData.autoModViolations || 0) * 3;

        // Add points for bans
        score += (userData.bans?.length || 0) * 20;

        // Add points for kicks
        score += (userData.kicks?.length || 0) * 15;

        // Add points for timeouts
        score += (userData.timeouts?.length || 0) * 8;

        // Check for recent activity
        if (userData.warnings && userData.warnings.length > 0) {
            const recentWarnings = userData.warnings.filter(w => {
                const warningAge = Date.now() - new Date(w.timestamp).getTime();
                return warningAge < 7 * 24 * 60 * 60 * 1000; // 7 days
            });
            score += recentWarnings.length * 10;
        }

        return score;
    }

    /**
     * Get risk level from score
     */
    static getRiskLevel(score) {
        if (score >= 50) return 'HIGH';
        if (score >= 25) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * Check if user is suspicious
     */
    static checkSuspiciousUser(member) {
        const flags = [];

        // Check account age
        const accountAge = Date.now() - member.user.createdTimestamp;
        const daysSinceCreation = Math.floor(accountAge / (1000 * 60 * 60 * 24));

        if (daysSinceCreation < 7) {
            flags.push({ type: 'new_account', severity: 'medium', days: daysSinceCreation });
        }

        // Check if account has no avatar
        if (!member.user.avatar) {
            flags.push({ type: 'no_avatar', severity: 'low' });
        }

        // Check username for suspicious patterns
        if (this.checkSuspiciousUsername(member.user.username)) {
            flags.push({ type: 'suspicious_username', severity: 'medium' });
        }

        return flags;
    }

    /**
     * Check for suspicious username patterns
     */
    static checkSuspiciousUsername(username) {
        // Check for excessive numbers
        const numberCount = (username.match(/\d/g) || []).length;
        if (numberCount > username.length * 0.5) return true;

        // Check for excessive special characters
        const specialCharCount = (username.match(/[^a-zA-Z0-9]/g) || []).length;
        if (specialCharCount > username.length * 0.3) return true;

        // Check for common bot/spam patterns
        const spamPatterns = [
            /discord\.gg/i,
            /nitro/i,
            /free/i,
            /gift/i,
            /promo/i
        ];

        for (const pattern of spamPatterns) {
            if (pattern.test(username)) return true;
        }

        return false;
    }

    /**
     * Detect raid attempt
     */
    static detectRaid(guild, serverData) {
        if (!serverData.recentJoins || serverData.recentJoins.length === 0) {
            return { isRaid: false, joinCount: 0 };
        }

        const now = Date.now();
        const oneMinuteAgo = now - 60000;

        // Count joins in the last minute
        const recentJoins = serverData.recentJoins.filter(timestamp => timestamp > oneMinuteAgo);

        // Raid detected if 10+ joins in 1 minute
        const isRaid = recentJoins.length >= 10;

        return { isRaid, joinCount: recentJoins.length };
    }

    /**
     * Analyze message for toxicity (basic implementation)
     */
    static analyzeToxicity(content) {
        const toxicKeywords = [
            'hate', 'kill', 'die', 'stupid', 'idiot', 'dumb',
            'trash', 'garbage', 'worthless', 'loser', 'noob'
        ];

        const lowerContent = content.toLowerCase();
        let toxicityScore = 0;

        for (const keyword of toxicKeywords) {
            if (lowerContent.includes(keyword)) {
                toxicityScore += 10;
            }
        }

        // Check for excessive punctuation (!!!, ???)
        const excessivePunctuation = content.match(/[!?]{3,}/g);
        if (excessivePunctuation) {
            toxicityScore += 5;
        }

        return {
            score: toxicityScore,
            level: toxicityScore >= 30 ? 'HIGH' : toxicityScore >= 15 ? 'MEDIUM' : 'LOW',
            isToxic: toxicityScore >= 15
        };
    }

    /**
     * Scan for phishing attempts
     */
    static scanForPhishing(content) {
        const phishingPatterns = [
            /free\s+nitro/i,
            /claim\s+your/i,
            /limited\s+time/i,
            /click\s+here/i,
            /verify\s+account/i,
            /steam\s+gift/i,
            /csgo\s+skins/i
        ];

        for (const pattern of phishingPatterns) {
            if (pattern.test(content)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get security report for user
     */
    static getUserSecurityReport(guildId, userId) {
        const userData = db.getUser(guildId, userId) || {};
        
        const riskScore = this.calculateRiskScore(userData);
        const riskLevel = this.getRiskLevel(riskScore);

        return {
            userId,
            infractions: userData.infractions || 0,
            warnings: userData.warnings?.length || 0,
            bans: userData.bans?.length || 0,
            kicks: userData.kicks?.length || 0,
            timeouts: userData.timeouts?.length || 0,
            autoModViolations: userData.autoModViolations || 0,
            riskScore,
            riskLevel,
            flags: userData.flags || [],
            lastActive: userData.lastActive
        };
    }

    /**
     * Get server security report
     */
    static getServerSecurityReport(guildId) {
        const serverData = db.getServer(guildId) || {};
        const allUsers = db.getAllUsers(guildId) || {};

        // Calculate stats
        const totalUsers = Object.keys(allUsers).length;
        const highRiskUsers = Object.values(allUsers).filter(user => {
            const score = this.calculateRiskScore(user);
            return this.getRiskLevel(score) === 'HIGH';
        }).length;

        const mediumRiskUsers = Object.values(allUsers).filter(user => {
            const score = this.calculateRiskScore(user);
            return this.getRiskLevel(score) === 'MEDIUM';
        }).length;

        return {
            guildId,
            totalUsers,
            highRiskUsers,
            mediumRiskUsers,
            totalWarnings: serverData.totalWarnings || 0,
            totalBans: serverData.totalBans || 0,
            totalKicks: serverData.totalKicks || 0,
            totalTimeouts: serverData.totalTimeouts || 0,
            totalReports: serverData.totalReports || 0,
            pendingReports: serverData.reports?.filter(r => r.status === 'pending').length || 0,
            securityLevel: serverData.securityLevel,
            autoModEnabled: serverData.autoMod,
            raidMode: serverData.raidMode || false
        };
    }
}

module.exports = SecurityService;