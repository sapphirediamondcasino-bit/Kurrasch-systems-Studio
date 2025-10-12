/**
 * Roblox API Service
 * Handles Roblox API integration and ban syncing
 */

const axios = require('axios');
const db = require('../database/db');
const logger = require('./logger');

class RobloxAPIService {
    constructor() {
        this.baseURL = 'https://users.roblox.com';
        this.apiURL = 'https://api.roblox.com';
        this.thumbnailURL = 'https://thumbnails.roblox.com';
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get user by username
     */
    async getUserByUsername(username) {
        try {
            // Check cache first
            const cacheKey = `user_${username.toLowerCase()}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const response = await axios.post(`${this.baseURL}/v1/usernames/users`, {
                usernames: [username],
                excludeBannedUsers: false
            });

            if (!response.data.data || response.data.data.length === 0) {
                return { success: false, error: 'User not found' };
            }

            const userData = response.data.data[0];
            const result = {
                success: true,
                userId: userData.id,
                username: userData.name,
                displayName: userData.displayName,
                hasVerifiedBadge: userData.hasVerifiedBadge || false
            };

            // Cache the result
            this.setCache(cacheKey, result);

            logger.api('Roblox', 'getUserByUsername', 'success');
            return result;

        } catch (error) {
            logger.error('Roblox API - getUserByUsername failed', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get user by ID
     */
    async getUserById(userId) {
        try {
            // Check cache first
            const cacheKey = `user_id_${userId}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const response = await axios.get(`${this.baseURL}/v1/users/${userId}`);

            const result = {
                success: true,
                userId: response.data.id,
                username: response.data.name,
                displayName: response.data.displayName,
                description: response.data.description,
                created: response.data.created,
                isBanned: response.data.isBanned || false,
                hasVerifiedBadge: response.data.hasVerifiedBadge || false
            };

            // Cache the result
            this.setCache(cacheKey, result);

            logger.api('Roblox', 'getUserById', 'success');
            return result;

        } catch (error) {
            logger.error('Roblox API - getUserById failed', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verify user owns Roblox account by checking description
     */
    async verifyUserOwnership(robloxUsername, verificationCode) {
        try {
            const userResult = await this.getUserByUsername(robloxUsername);
            
            if (!userResult.success) {
                return { verified: false, error: 'User not found' };
            }

            const userDetails = await this.getUserById(userResult.userId);
            
            if (!userDetails.success) {
                return { verified: false, error: 'Failed to fetch user details' };
            }

            // Check if verification code is in description
            const description = userDetails.description || '';
            const verified = description.includes(verificationCode);

            if (verified) {
                logger.info(`Roblox verification successful: ${robloxUsername}`);
            }

            return {
                verified,
                userId: userResult.userId,
                username: userResult.username,
                displayName: userResult.displayName
            };

        } catch (error) {
            logger.error('Roblox verification failed', error);
            return { verified: false, error: error.message };
        }
    }

    /**
     * Get user thumbnail/avatar
     */
    async getUserThumbnail(userId, size = '150x150') {
        try {
            const cacheKey = `thumbnail_${userId}_${size}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const response = await axios.get(
                `${this.thumbnailURL}/v1/users/avatar-headshot?userIds=${userId}&size=${size}&format=Png`
            );

            if (!response.data.data || response.data.data.length === 0) {
                return { success: false, error: 'Thumbnail not found' };
            }

            const result = {
                success: true,
                thumbnailUrl: response.data.data[0].imageUrl
            };

            this.setCache(cacheKey, result);

            logger.api('Roblox', 'getUserThumbnail', 'success');
            return result;

        } catch (error) {
            logger.error('Roblox API - getUserThumbnail failed', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Check if user is banned on Roblox
     */
    async isUserBanned(userId) {
        try {
            const userDetails = await this.getUserById(userId);
            
            if (!userDetails.success) {
                return { success: false, error: 'Failed to fetch user details' };
            }

            return {
                success: true,
                isBanned: userDetails.isBanned || false
            };

        } catch (error) {
            logger.error('Roblox API - isUserBanned failed', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sync bans between Discord and Roblox
     */
    async syncBans(guildId, discordGuild) {
        try {
            const serverData = db.getServer(guildId) || {};
            
            // Check if ban sync is enabled
            if (!serverData.banSyncEnabled) {
                return { success: false, error: 'Ban sync not enabled' };
            }

            // Check if server has Pro tier
            if (!['Pro', 'Enterprise'].includes(serverData.tier)) {
                return { success: false, error: 'Pro tier required for ban syncing' };
            }

            const allUsers = db.getAllUsers(guildId) || {};
            const syncResults = {
                checked: 0,
                banned: 0,
                errors: 0,
                details: []
            };

            // Get all linked Roblox users
            for (const [discordId, userData] of Object.entries(allUsers)) {
                if (!userData.robloxLinked || !userData.robloxUserId) continue;

                syncResults.checked++;

                try {
                    // Check if user is banned on Roblox
                    const banStatus = await this.isUserBanned(userData.robloxUserId);
                    
                    if (!banStatus.success) {
                        syncResults.errors++;
                        continue;
                    }

                    // If banned on Roblox, ban on Discord
                    if (banStatus.isBanned) {
                        const member = discordGuild.members.cache.get(discordId);
                        
                        if (member && member.bannable) {
                            await member.ban({
                                reason: 'Banned on Roblox - Auto-synced by Game Killer\'s Security'
                            });

                            syncResults.banned++;
                            syncResults.details.push({
                                discordId,
                                robloxUsername: userData.robloxUsername,
                                action: 'banned'
                            });

                            logger.security('Roblox Ban Sync', {
                                discordId,
                                robloxUsername: userData.robloxUsername
                            }, discordGuild.name);
                        }
                    }

                } catch (error) {
                    syncResults.errors++;
                    logger.error('Error syncing ban for user', error, { discordId });
                }
            }

            // Update server data
            serverData.banSyncLastRun = new Date().toISOString();
            serverData.bansSynced = (serverData.bansSynced || 0) + syncResults.banned;
            db.saveServer(guildId, serverData);

            logger.info('Roblox ban sync completed', syncResults);

            return {
                success: true,
                results: syncResults
            };

        } catch (error) {
            logger.error('Roblox ban sync failed', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get game info
     */
    async getGameInfo(gameId) {
        try {
            const cacheKey = `game_${gameId}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const response = await axios.get(`${this.apiURL}/games/v1/games?universeIds=${gameId}`);

            if (!response.data.data || response.data.data.length === 0) {
                return { success: false, error: 'Game not found' };
            }

            const gameData = response.data.data[0];
            const result = {
                success: true,
                id: gameData.id,
                name: gameData.name,
                description: gameData.description,
                creator: gameData.creator,
                rootPlaceId: gameData.rootPlaceId,
                created: gameData.created,
                updated: gameData.updated
            };

            this.setCache(cacheKey, result);

            logger.api('Roblox', 'getGameInfo', 'success');
            return result;

        } catch (error) {
            logger.error('Roblox API - getGameInfo failed', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Link Discord user to Roblox account
     */
    async linkAccount(guildId, discordUserId, robloxUserId, robloxUsername) {
        try {
            const userData = db.getUser(guildId, discordUserId) || {};

            userData.robloxLinked = true;
            userData.robloxUserId = robloxUserId;
            userData.robloxUsername = robloxUsername;
            userData.robloxLinkedDate = new Date().toISOString();
            userData.robloxVerified = true;

            db.saveUser(guildId, discordUserId, userData);

            logger.info('Roblox account linked', {
                discordUserId,
                robloxUsername
            });

            return { success: true };

        } catch (error) {
            logger.error('Failed to link Roblox account', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Unlink Discord user from Roblox account
     */
    async unlinkAccount(guildId, discordUserId) {
        try {
            const userData = db.getUser(guildId, discordUserId) || {};

            userData.robloxLinked = false;
            userData.robloxUserId = null;
            userData.robloxUsername = null;
            userData.robloxLinkedDate = null;
            userData.robloxVerified = false;

            db.saveUser(guildId, discordUserId, userData);

            logger.info('Roblox account unlinked', { discordUserId });

            return { success: true };

        } catch (error) {
            logger.error('Failed to unlink Roblox account', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Cache management
     */
    setCache(key, value) {
        this.cache.set(key, {
            data: value,
            expiry: Date.now() + this.cacheExpiry
        });
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        
        if (!cached) return null;
        
        if (Date.now() > cached.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    clearCache() {
        this.cache.clear();
        logger.info('Roblox API cache cleared');
    }

    /**
     * Get cache stats
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            expiryTime: this.cacheExpiry
        };
    }
}

// Create singleton instance
const robloxAPI = new RobloxAPIService();

module.exports = robloxAPI;