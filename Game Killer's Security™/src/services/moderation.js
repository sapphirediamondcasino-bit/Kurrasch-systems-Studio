/**
 * Moderation Service
 * Helper functions for moderation actions
 */

const { EmbedBuilder } = require('discord.js');
const db = require('../database/db');
const { EMOJIS, COLORS } = require('../utils/constants');
const Incident = require('../database/models/Incident');

class ModerationService {
    /**
     * Ban a user
     */
    static async banUser(guild, targetUser, moderator, reason, duration = 'Permanent', options = {}) {
        try {
            const member = guild.members.cache.get(targetUser.id);

            if (!member) {
                return { success: false, error: 'User not found in server' };
            }

            if (!member.bannable) {
                return { success: false, error: 'User cannot be banned (higher permissions)' };
            }

            // Execute ban
            await member.ban({
                reason: `${reason} | By ${moderator.tag} | Duration: ${duration}`,
                deleteMessageSeconds: options.deleteMessageDays ? options.deleteMessageDays * 24 * 60 * 60 : 0
            });

            // Save to database
            const userData = db.getUser(guild.id, targetUser.id) || {};
            if (!userData.bans) userData.bans = [];
            
            const ban = {
                id: Date.now().toString(),
                reason,
                duration,
                moderator: moderator.id,
                timestamp: new Date().toISOString()
            };

            userData.bans.push(ban);
            userData.infractions = (userData.infractions || 0) + 1;
            userData.isBanned = true;
            db.saveUser(guild.id, targetUser.id, userData);

            // Create incident
            const incident = Incident.createBan(guild.id, targetUser.id, moderator.id, reason);
            incident.actionDetails = { duration };
            
            const serverData = db.getServer(guild.id) || {};
            if (!serverData.incidents) serverData.incidents = [];
            serverData.incidents.push(incident.toJSON());
            serverData.totalBans = (serverData.totalBans || 0) + 1;
            db.saveServer(guild.id, serverData);

            // Try to DM user
            await this.notifyUser(targetUser, 'ban', guild, reason, duration);

            return { success: true, ban, incident };

        } catch (error) {
            console.error('Ban error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Kick a user
     */
    static async kickUser(guild, targetUser, moderator, reason) {
        try {
            const member = guild.members.cache.get(targetUser.id);

            if (!member) {
                return { success: false, error: 'User not found in server' };
            }

            if (!member.kickable) {
                return { success: false, error: 'User cannot be kicked (higher permissions)' };
            }

            // Execute kick
            await member.kick(`${reason} | By ${moderator.tag}`);

            // Save to database
            const userData = db.getUser(guild.id, targetUser.id) || {};
            if (!userData.kicks) userData.kicks = [];
            
            const kick = {
                id: Date.now().toString(),
                reason,
                moderator: moderator.id,
                timestamp: new Date().toISOString()
            };

            userData.kicks.push(kick);
            userData.infractions = (userData.infractions || 0) + 1;
            db.saveUser(guild.id, targetUser.id, userData);

            // Create incident
            const incident = Incident.createKick(guild.id, targetUser.id, moderator.id, reason);
            
            const serverData = db.getServer(guild.id) || {};
            if (!serverData.incidents) serverData.incidents = [];
            serverData.incidents.push(incident.toJSON());
            serverData.totalKicks = (serverData.totalKicks || 0) + 1;
            db.saveServer(guild.id, serverData);

            // Try to DM user
            await this.notifyUser(targetUser, 'kick', guild, reason);

            return { success: true, kick, incident };

        } catch (error) {
            console.error('Kick error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Warn a user
     */
    static async warnUser(guild, targetUser, moderator, reason) {
        try {
            // Save to database
            const userData = db.getUser(guild.id, targetUser.id) || {
                userId: targetUser.id,
                warnings: [],
                infractions: 0
            };

            const warning = {
                id: Date.now().toString(),
                reason,
                moderator: moderator.id,
                timestamp: new Date().toISOString()
            };

            userData.warnings.push(warning);
            userData.infractions = (userData.infractions || 0) + 1;
            db.saveUser(guild.id, targetUser.id, userData);

            // Create incident
            const incident = Incident.createWarning(guild.id, targetUser.id, moderator.id, reason);
            
            const serverData = db.getServer(guild.id) || {};
            if (!serverData.incidents) serverData.incidents = [];
            serverData.incidents.push(incident.toJSON());
            serverData.totalWarnings = (serverData.totalWarnings || 0) + 1;
            db.saveServer(guild.id, serverData);

            // Try to DM user
            await this.notifyUser(targetUser, 'warn', guild, reason, null, userData.warnings.length);

            return { success: true, warning, incident, totalWarnings: userData.warnings.length };

        } catch (error) {
            console.error('Warn error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Timeout a user
     */
    static async timeoutUser(guild, targetUser, moderator, reason, duration) {
        try {
            const member = guild.members.cache.get(targetUser.id);

            if (!member) {
                return { success: false, error: 'User not found in server' };
            }

            if (!member.moderatable) {
                return { success: false, error: 'User cannot be timed out (higher permissions)' };
            }

            // Execute timeout
            const timeoutDuration = duration * 60 * 1000; // Convert minutes to milliseconds
            await member.timeout(timeoutDuration, `${reason} | By ${moderator.tag}`);

            // Save to database
            const userData = db.getUser(guild.id, targetUser.id) || {};
            if (!userData.timeouts) userData.timeouts = [];
            
            const timeout = {
                id: Date.now().toString(),
                reason,
                duration: duration,
                moderator: moderator.id,
                timestamp: new Date().toISOString(),
                expiresAt: new Date(Date.now() + timeoutDuration).toISOString()
            };

            userData.timeouts.push(timeout);
            userData.infractions = (userData.infractions || 0) + 1;
            db.saveUser(guild.id, targetUser.id, userData);

            // Create incident
            const incident = Incident.createTimeout(guild.id, targetUser.id, moderator.id, reason, duration);
            
            const serverData = db.getServer(guild.id) || {};
            if (!serverData.incidents) serverData.incidents = [];
            serverData.incidents.push(incident.toJSON());
            serverData.totalTimeouts = (serverData.totalTimeouts || 0) + 1;
            db.saveServer(guild.id, serverData);

            // Try to DM user
            await this.notifyUser(targetUser, 'timeout', guild, reason, duration);

            return { success: true, timeout, incident };

        } catch (error) {
            console.error('Timeout error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Remove timeout from user
     */
    static async removeTimeout(guild, targetUser, moderator) {
        try {
            const member = guild.members.cache.get(targetUser.id);

            if (!member) {
                return { success: false, error: 'User not found in server' };
            }

            await member.timeout(null, `Timeout removed by ${moderator.tag}`);

            return { success: true };

        } catch (error) {
            console.error('Remove timeout error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Notify user of moderation action
     */
    static async notifyUser(user, action, guild, reason, duration = null, warningCount = null) {
        try {
            const titles = {
                ban: `${EMOJIS.BAN} You have been banned`,
                kick: `${EMOJIS.KICK} You have been kicked`,
                warn: `${EMOJIS.WARN} You have been warned`,
                timeout: `${EMOJIS.TIMEOUT} You have been timed out`
            };

            const colors = {
                ban: COLORS.ERROR,
                kick: COLORS.WARNING,
                warn: COLORS.WARNING,
                timeout: COLORS.WARNING
            };

            const embed = new EmbedBuilder()
                .setColor(colors[action])
                .setTitle(titles[action])
                .setDescription(`You have been ${action === 'warn' ? 'warned' : action}ed in **${guild.name}**`)
                .addFields({ name: '📝 Reason', value: reason, inline: false });

            if (duration) {
                embed.addFields({ name: '⏱️ Duration', value: duration.toString(), inline: true });
            }

            if (warningCount) {
                embed.addFields({ name: '⚠️ Total Warnings', value: warningCount.toString(), inline: true });
            }

            embed.setFooter({ text: 'If you believe this was a mistake, contact the server moderators' })
                .setTimestamp();

            await user.send({ embeds: [embed] });
            return true;

        } catch (error) {
            // User has DMs disabled or blocked the bot
            return false;
        }
    }

    /**
     * Log moderation action to channel
     */
    static async logAction(guild, action, moderator, targetUser, reason, additionalData = {}) {
        try {
            const serverData = db.getServer(guild.id) || {};
            
            if (!serverData.logChannel) return;

            const logChannel = guild.channels.cache.get(serverData.logChannel);
            if (!logChannel) return;

            const actionEmojis = {
                ban: EMOJIS.BAN,
                kick: EMOJIS.KICK,
                warn: EMOJIS.WARN,
                timeout: EMOJIS.TIMEOUT,
                unban: '🔓',
                untimeout: '⏰'
            };

            const actionColors = {
                ban: COLORS.ERROR,
                kick: COLORS.WARNING,
                warn: COLORS.WARNING,
                timeout: COLORS.WARNING,
                unban: COLORS.SUCCESS,
                untimeout: COLORS.SUCCESS
            };

            const embed = new EmbedBuilder()
                .setColor(actionColors[action] || COLORS.INFO)
                .setTitle(`${actionEmojis[action] || '⚡'} Moderation Action: ${action.toUpperCase()}`)
                .addFields(
                    { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                    { name: '👮 Moderator', value: moderator.tag, inline: true },
                    { name: '📝 Reason', value: reason, inline: false }
                )
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            // Add additional data
            if (additionalData.duration) {
                embed.addFields({ name: '⏱️ Duration', value: additionalData.duration.toString(), inline: true });
            }

            if (additionalData.warningCount) {
                embed.addFields({ name: '⚠️ Total Warnings', value: additionalData.warningCount.toString(), inline: true });
            }

            await logChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Log action error:', error);
        }
    }

    /**
     * Check if user should be auto-actioned based on infractions
     */
    static shouldAutoAction(userData, serverData) {
        const infractions = userData.infractions || 0;
        const maxWarnings = serverData.maxWarnings || 3;

        if (infractions >= maxWarnings && serverData.autoTimeout) {
            return { action: 'timeout', duration: serverData.timeoutDuration || 60 };
        }

        return null;
    }

    /**
     * Purge messages from channel
     */
    static async purgeMessages(channel, amount, filter = null) {
        try {
            let messages = await channel.messages.fetch({ limit: amount });

            // Apply filter if provided
            if (filter) {
                messages = messages.filter(filter);
            }

            // Only delete messages younger than 14 days
            messages = messages.filter(msg => {
                const msgAge = Date.now() - msg.createdTimestamp;
                return msgAge < 14 * 24 * 60 * 60 * 1000;
            });

            if (messages.size === 0) {
                return { success: false, error: 'No messages to delete', deleted: 0 };
            }

            const deleted = await channel.bulkDelete(messages, true);

            return { success: true, deleted: deleted.size };

        } catch (error) {
            console.error('Purge error:', error);
            return { success: false, error: error.message, deleted: 0 };
        }
    }
}

module.exports = ModerationService;