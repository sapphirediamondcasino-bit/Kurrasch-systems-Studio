const { EmbedBuilder } = require('discord.js');

/**
 * Embed Templates for Game Killer's Security
 */

module.exports = {
    /**
     * Success embed
     */
    success(title, description, fields = []) {
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(`✅ ${title}`)
            .setDescription(description)
            .setTimestamp();

        if (fields.length > 0) {
            embed.addFields(fields);
        }

        return embed;
    },

    /**
     * Error embed
     */
    error(title, description, fields = []) {
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle(`❌ ${title}`)
            .setDescription(description)
            .setTimestamp();

        if (fields.length > 0) {
            embed.addFields(fields);
        }

        return embed;
    },

    /**
     * Warning embed
     */
    warning(title, description, fields = []) {
        const embed = new EmbedBuilder()
            .setColor('#ffff00')
            .setTitle(`⚠️ ${title}`)
            .setDescription(description)
            .setTimestamp();

        if (fields.length > 0) {
            embed.addFields(fields);
        }

        return embed;
    },

    /**
     * Info embed
     */
    info(title, description, fields = []) {
        const embed = new EmbedBuilder()
            .setColor('#00d9ff')
            .setTitle(`ℹ️ ${title}`)
            .setDescription(description)
            .setTimestamp();

        if (fields.length > 0) {
            embed.addFields(fields);
        }

        return embed;
    },

    /**
     * Moderation action embed
     */
    moderationAction(actionType, target, moderator, reason, additionalFields = []) {
        const colors = {
            ban: '#ff0000',
            kick: '#ff9900',
            warn: '#ffff00',
            timeout: '#ffa500',
            purge: '#00ff00'
        };

        const emojis = {
            ban: '🔨',
            kick: '👢',
            warn: '⚠️',
            timeout: '⏰',
            purge: '🗑️'
        };

        const embed = new EmbedBuilder()
            .setColor(colors[actionType] || '#808080')
            .setTitle(`${emojis[actionType] || '⚡'} ${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Action`)
            .addFields(
                { name: '👤 User', value: `${target.tag} (${target.id})`, inline: true },
                { name: '👮 Moderator', value: moderator.tag, inline: true },
                { name: '📝 Reason', value: reason || 'No reason provided', inline: false }
            )
            .setTimestamp();

        if (additionalFields.length > 0) {
            embed.addFields(additionalFields);
        }

        return embed;
    },

    /**
     * Security report embed
     */
    securityReport(reportData, guild) {
        const reportedUser = guild.members.cache.get(reportData.reportedUser);
        const reporter = guild.members.cache.get(reportData.reporter);

        const statusColors = {
            pending: '#ffff00',
            approved: '#00ff00',
            denied: '#ff0000'
        };

        const statusEmojis = {
            pending: '🟡',
            approved: '✅',
            denied: '❌'
        };

        return new EmbedBuilder()
            .setColor(statusColors[reportData.status] || '#808080')
            .setTitle('🚨 Security Report')
            .setDescription(`Report ID: \`${reportData.id}\``)
            .addFields(
                { 
                    name: '👤 Reported User', 
                    value: reportedUser ? `${reportedUser.user.tag} (${reportedUser.id})` : `User ID: ${reportData.reportedUser}`, 
                    inline: true 
                },
                { 
                    name: '👮 Reporter', 
                    value: reporter ? reporter.user.tag : 'Unknown', 
                    inline: true 
                },
                { 
                    name: '⏱️ Status', 
                    value: `${statusEmojis[reportData.status]} ${reportData.status.toUpperCase()}`, 
                    inline: true 
                },
                { name: '📋 Reason', value: reportData.reason, inline: false },
                { name: '🔍 Evidence', value: reportData.evidence || 'No evidence provided', inline: false },
                { 
                    name: '📅 Submitted', 
                    value: `<t:${Math.floor(new Date(reportData.timestamp).getTime() / 1000)}:R>`, 
                    inline: true 
                }
            )
            .setTimestamp();
    },

    /**
     * User check embed
     */
    userCheck(userData, targetUser, guild) {
        const infractions = userData.infractions || 0;
        const warnings = userData.warnings?.length || 0;

        let riskLevel = '🟢 Low Risk';
        let color = '#00ff00';

        if (infractions >= 5 || warnings >= 3) {
            riskLevel = '🔴 High Risk';
            color = '#ff0000';
        } else if (infractions >= 3 || warnings >= 2) {
            riskLevel = '🟡 Medium Risk';
            color = '#ffff00';
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🔍 User Security Check')
            .setDescription(`Security information for **${targetUser.tag}**`)
            .addFields(
                { name: '👤 User', value: targetUser.tag, inline: true },
                { name: '🆔 User ID', value: targetUser.id, inline: true },
                { name: '⚠️ Risk Level', value: riskLevel, inline: true },
                { name: '📊 Total Infractions', value: `${infractions}`, inline: true },
                { name: '⚠️ Active Warnings', value: `${warnings}`, inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        // Add recent warnings
        if (userData.warnings && userData.warnings.length > 0) {
            const recentWarnings = userData.warnings
                .slice(-3)
                .reverse()
                .map((w, i) => {
                    const mod = guild.members.cache.get(w.moderator);
                    const modName = mod ? mod.user.tag : 'Unknown';
                    const timestamp = new Date(w.timestamp);
                    return `**${i + 1}.** ${w.reason}\n*By ${modName} • <t:${Math.floor(timestamp.getTime() / 1000)}:R>*`;
                })
                .join('\n\n');

            embed.addFields({
                name: '📋 Recent Warnings',
                value: recentWarnings,
                inline: false
            });
        }

        return embed;
    },

    /**
     * Dashboard embed
     */
    dashboard(guild, stats) {
        return new EmbedBuilder()
            .setColor('#00d9ff')
            .setTitle('🛡️ Game Killer\'s Security™ - Dashboard')
            .setDescription(`Security overview for **${guild.name}**`)
            .addFields(
                {
                    name: '📊 Server Statistics',
                    value: `**Total Members:** ${guild.memberCount}\n` +
                           `**Total Warnings:** ${stats.totalWarnings}\n` +
                           `**Total Infractions:** ${stats.totalInfractions}\n` +
                           `**Pending Reports:** ${stats.pendingReports}`,
                    inline: true
                },
                {
                    name: '🚨 Security Status',
                    value: `**High-Risk Users:** ${stats.highRiskUsers}\n` +
                           `**Total Reports:** ${stats.totalReports}\n` +
                           `**Auto-Mod:** ${stats.autoMod ? '✅ Enabled' : '❌ Disabled'}\n` +
                           `**Security Level:** ${stats.securityLevel || 'Medium'}`,
                    inline: true
                }
            )
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'Game Killer\'s Security™' })
            .setTimestamp();
    },

    /**
     * Welcome embed for new members
     */
    welcome(member, guild, customMessage = null) {
        return new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(`👋 Welcome to ${guild.name}!`)
            .setDescription(
                customMessage || 
                `Welcome ${member.user.tag}! Please read the rules and enjoy your stay.`
            )
            .addFields(
                { name: '📋 Member Count', value: `You are member #${guild.memberCount}`, inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `User ID: ${member.user.id}` })
            .setTimestamp();
    },

    /**
     * Subscription tier embed
     */
    subscriptionTier(tierName, features, price) {
        const colors = {
            Free: '#808080',
            Basic: '#00d9ff',
            Pro: '#9b59b6',
            Enterprise: '#ff6600'
        };

        return new EmbedBuilder()
            .setColor(colors[tierName] || '#808080')
            .setTitle(`💎 ${tierName} Tier`)
            .setDescription('Features included in this tier:')
            .addFields(
                { name: '✨ Features', value: features.join('\n'), inline: false },
                { name: '💰 Price', value: price, inline: true }
            )
            .setFooter({ text: 'Game Killer\'s Security™ | Subscription Plans' })
            .setTimestamp();
    },

    /**
     * Log entry embed
     */
    logEntry(logType, description, fields = []) {
        const colors = {
            security: '#ff0000',
            moderation: '#ffff00',
            system: '#00d9ff',
            user: '#00ff00'
        };

        const emojis = {
            security: '🔒',
            moderation: '⚠️',
            system: '⚙️',
            user: '👤'
        };

        const embed = new EmbedBuilder()
            .setColor(colors[logType] || '#808080')
            .setTitle(`${emojis[logType] || '📋'} ${logType.charAt(0).toUpperCase() + logType.slice(1)} Log`)
            .setDescription(description)
            .setTimestamp();

        if (fields.length > 0) {
            embed.addFields(fields);
        }

        return embed;
    }
};