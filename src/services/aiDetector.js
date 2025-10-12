/**
 * AI Detector Service
 * AI-powered threat detection (Phase 2 - Advanced Feature)
 * Note: This is a placeholder implementation for Pro/Enterprise tiers
 */

const db = require('../database/db');
const SecurityService = require('./security');
const logger = require('./logger');

class AIDetectorService {
    constructor() {
        this.enabled = false;
        this.modelLoaded = false;
        this.threatPatterns = this.initializeThreatPatterns();
    }

    /**
     * Initialize threat patterns for AI detection
     */
    initializeThreatPatterns() {
        return {
            spam: {
                keywords: ['free', 'click', 'buy', 'limited', 'offer', 'deal', 'now'],
                weight: 1.0,
                threshold: 0.6
            },
            phishing: {
                keywords: ['verify', 'account', 'suspended', 'click here', 'claim', 'prize'],
                weight: 1.5,
                threshold: 0.7
            },
            harassment: {
                keywords: ['hate', 'kill', 'die', 'stupid', 'idiot', 'loser', 'trash'],
                weight: 2.0,
                threshold: 0.8
            },
            raid: {
                indicators: ['mass_join', 'similar_usernames', 'coordinated_spam'],
                weight: 3.0,
                threshold: 0.9
            }
        };
    }

    /**
     * Enable AI detection (Pro/Enterprise only)
     */
    enable() {
        this.enabled = true;
        logger.info('AI Detector enabled');
    }

    /**
     * Disable AI detection
     */
    disable() {
        this.enabled = false;
        logger.info('AI Detector disabled');
    }

    /**
     * Analyze message for threats using AI
     */
    async analyzeMessage(message, serverData) {
        if (!this.enabled) {
            return { threats: [], confidence: 0, aiEnabled: false };
        }

        // Check if server has Pro tier
        if (!serverData.tier || !['Pro', 'Enterprise'].includes(serverData.tier)) {
            return { threats: [], confidence: 0, aiEnabled: false, reason: 'Pro tier required' };
        }

        try {
            const threats = [];
            const content = message.content.toLowerCase();

            // Analyze for spam
            const spamAnalysis = this.analyzeSpam(content);
            if (spamAnalysis.isSpam) {
                threats.push({
                    type: 'spam',
                    confidence: spamAnalysis.confidence,
                    severity: this.getSeverity(spamAnalysis.confidence),
                    description: 'AI detected spam pattern'
                });
            }

            // Analyze for phishing
            const phishingAnalysis = this.analyzePhishing(content);
            if (phishingAnalysis.isPhishing) {
                threats.push({
                    type: 'phishing',
                    confidence: phishingAnalysis.confidence,
                    severity: this.getSeverity(phishingAnalysis.confidence),
                    description: 'AI detected phishing attempt'
                });
            }

            // Analyze for harassment/toxicity
            const toxicityAnalysis = this.analyzeToxicity(content);
            if (toxicityAnalysis.isToxic) {
                threats.push({
                    type: 'toxicity',
                    confidence: toxicityAnalysis.confidence,
                    severity: this.getSeverity(toxicityAnalysis.confidence),
                    description: 'AI detected toxic content'
                });
            }

            // Analyze user behavior pattern
            const behaviorAnalysis = await this.analyzeUserBehavior(message.author.id, message.guild.id);
            if (behaviorAnalysis.suspicious) {
                threats.push({
                    type: 'suspicious_behavior',
                    confidence: behaviorAnalysis.confidence,
                    severity: this.getSeverity(behaviorAnalysis.confidence),
                    description: 'AI detected suspicious user behavior'
                });
            }

            const overallConfidence = threats.length > 0 
                ? threats.reduce((sum, t) => sum + t.confidence, 0) / threats.length 
                : 0;

            return {
                threats,
                confidence: overallConfidence,
                aiEnabled: true,
                analyzed: true
            };

        } catch (error) {
            logger.error('AI analysis failed', error);
            return { threats: [], confidence: 0, aiEnabled: true, error: error.message };
        }
    }

    /**
     * Analyze content for spam patterns
     */
    analyzeSpam(content) {
        const pattern = this.threatPatterns.spam;
        let score = 0;
        let keywordMatches = 0;

        for (const keyword of pattern.keywords) {
            if (content.includes(keyword)) {
                keywordMatches++;
                score += pattern.weight;
            }
        }

        // Check for repeated characters/words
        if (/(.)\1{5,}/.test(content)) {
            score += 2;
        }

        // Check for excessive links
        const links = content.match(/https?:\/\/[^\s]+/g) || [];
        if (links.length > 3) {
            score += links.length;
        }

        const confidence = Math.min(score / 10, 1.0);
        const isSpam = confidence >= pattern.threshold;

        return { isSpam, confidence, keywordMatches };
    }

    /**
     * Analyze content for phishing
     */
    analyzePhishing(content) {
        const pattern = this.threatPatterns.phishing;
        let score = 0;
        let keywordMatches = 0;

        for (const keyword of pattern.keywords) {
            if (content.includes(keyword)) {
                keywordMatches++;
                score += pattern.weight;
            }
        }

        // Check for suspicious link patterns
        if (/bit\.ly|tinyurl|t\.co/.test(content)) {
            score += 2;
        }

        // Check for urgent language
        if (/urgent|immediately|now|asap/i.test(content)) {
            score += 1.5;
        }

        const confidence = Math.min(score / 10, 1.0);
        const isPhishing = confidence >= pattern.threshold;

        return { isPhishing, confidence, keywordMatches };
    }

    /**
     * Analyze content for toxicity
     */
    analyzeToxicity(content) {
        const pattern = this.threatPatterns.harassment;
        let score = 0;
        let keywordMatches = 0;

        for (const keyword of pattern.keywords) {
            if (content.includes(keyword)) {
                keywordMatches++;
                score += pattern.weight;
            }
        }

        // Check for aggressive punctuation
        const aggressivePunctuation = content.match(/[!?]{3,}/g) || [];
        score += aggressivePunctuation.length * 0.5;

        // Check for all caps (aggressive tone)
        const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
        if (capsRatio > 0.7 && content.length > 10) {
            score += 1;
        }

        const confidence = Math.min(score / 10, 1.0);
        const isToxic = confidence >= pattern.threshold;

        return { isToxic, confidence, keywordMatches };
    }

    /**
     * Analyze user behavior patterns
     */
    async analyzeUserBehavior(userId, guildId) {
        try {
            const userData = db.getUser(guildId, userId) || {};
            let suspicionScore = 0;

            // Check message frequency
            if (userData.recentMessages && userData.recentMessages.length > 0) {
                const now = Date.now();
                const recentCount = userData.recentMessages.filter(t => now - t < 60000).length;
                
                if (recentCount > 10) {
                    suspicionScore += 3;
                }
            }

            // Check infraction history
            const infractions = userData.infractions || 0;
            suspicionScore += infractions * 0.5;

            // Check auto-mod violations
            const autoModViolations = userData.autoModViolations || 0;
            suspicionScore += autoModViolations * 0.3;

            // Check for rapid escalation
            if (userData.warnings && userData.warnings.length > 0) {
                const recentWarnings = userData.warnings.filter(w => {
                    const age = Date.now() - new Date(w.timestamp).getTime();
                    return age < 24 * 60 * 60 * 1000; // Last 24 hours
                });

                if (recentWarnings.length >= 3) {
                    suspicionScore += 2;
                }
            }

            const confidence = Math.min(suspicionScore / 10, 1.0);
            const suspicious = confidence >= 0.6;

            return { suspicious, confidence, score: suspicionScore };

        } catch (error) {
            logger.error('User behavior analysis failed', error);
            return { suspicious: false, confidence: 0, error: error.message };
        }
    }

    /**
     * Detect raid using AI pattern recognition
     */
    async detectRaid(guild, serverData) {
        if (!this.enabled) return { isRaid: false, confidence: 0 };

        try {
            let raidScore = 0;

            // Check join rate
            const joinRate = serverData.recentJoins?.length || 0;
            if (joinRate >= 10) {
                raidScore += 5;
            } else if (joinRate >= 5) {
                raidScore += 3;
            }

            // Check for similar usernames (potential bot raid)
            const recentMembers = guild.members.cache
                .filter(m => Date.now() - m.joinedTimestamp < 300000) // Last 5 minutes
                .map(m => m.user.username);

            const similarityScore = this.calculateUsernameSimilarity(recentMembers);
            raidScore += similarityScore * 2;

            // Check for coordinated activity
            const spamMessages = await this.detectCoordinatedSpam(guild, serverData);
            if (spamMessages > 5) {
                raidScore += 4;
            }

            const confidence = Math.min(raidScore / 10, 1.0);
            const isRaid = confidence >= this.threatPatterns.raid.threshold;

            return {
                isRaid,
                confidence,
                indicators: {
                    joinRate,
                    usernameSimilarity: similarityScore,
                    coordinatedSpam: spamMessages
                }
            };

        } catch (error) {
            logger.error('Raid detection failed', error);
            return { isRaid: false, confidence: 0, error: error.message };
        }
    }

    /**
     * Calculate username similarity score
     */
    calculateUsernameSimilarity(usernames) {
        if (usernames.length < 2) return 0;

        let similarityCount = 0;

        for (let i = 0; i < usernames.length; i++) {
            for (let j = i + 1; j < usernames.length; j++) {
                const similarity = this.stringSimilarity(usernames[i], usernames[j]);
                if (similarity > 0.7) {
                    similarityCount++;
                }
            }
        }

        return Math.min(similarityCount / usernames.length, 1.0);
    }

    /**
     * Calculate string similarity (simple implementation)
     */
    stringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    /**
     * Calculate Levenshtein distance
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * Detect coordinated spam
     */
    async detectCoordinatedSpam(guild, serverData) {
        // Placeholder: In real implementation, this would analyze message patterns
        // across multiple users in a short time frame
        return 0;
    }

    /**
     * Get severity from confidence score
     */
    getSeverity(confidence) {
        if (confidence >= 0.9) return 'critical';
        if (confidence >= 0.7) return 'high';
        if (confidence >= 0.5) return 'medium';
        return 'low';
    }

    /**
     * Generate AI insights for server
     */
    async generateInsights(guildId) {
        const serverData = db.getServer(guildId) || {};
        
        if (!['Pro', 'Enterprise'].includes(serverData.tier)) {
            return { available: false, reason: 'Pro tier required' };
        }

        const insights = [];

        // Analyze overall server security
        const securityReport = SecurityService.getServerSecurityReport(guildId);
        
        if (securityReport.highRiskUsers > 0) {
            insights.push({
                type: 'warning',
                message: `${securityReport.highRiskUsers} high-risk users detected`,
                recommendation: 'Consider reviewing these users and taking action'
            });
        }

        if (securityReport.pendingReports > 5) {
            insights.push({
                type: 'alert',
                message: `${securityReport.pendingReports} pending reports`,
                recommendation: 'Review pending reports to maintain server safety'
            });
        }

        if (!securityReport.autoModEnabled) {
            insights.push({
                type: 'suggestion',
                message: 'Auto-moderation is disabled',
                recommendation: 'Enable auto-mod to prevent spam and toxicity'
            });
        }

        return { available: true, insights, timestamp: new Date().toISOString() };
    }
}

// Create singleton instance
const aiDetector = new AIDetectorService();

module.exports = aiDetector;