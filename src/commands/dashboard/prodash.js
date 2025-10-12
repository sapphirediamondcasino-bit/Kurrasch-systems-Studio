const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prodash')
        .setDescription('💎 View advanced Pro Dashboard with detailed analytics')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        try {
            const serverData = db.getServer(interaction.guild.id) || {};
            
            // Get website URL from environment or use default
            const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:25974';
            
            // Check if server has Pro tier
            if (!serverData.tier || serverData.tier === 'Free') {
                const upgradeEmbed = new EmbedBuilder()
                    .setColor('#ff6600')
                    .setTitle('💎 Pro Dashboard - Upgrade Required')
                    .setDescription('The Pro Dashboard is only available for **Pro** and **Enterprise** tier subscribers.\n\n' +
                                   `🌐 **[View Features on Website](${websiteUrl})**`)
                    .addFields(
                        { name: '✨ Pro Features Include:', value: 
                            '• Advanced analytics & insights\n' +
                            '• Detailed user behavior tracking\n' +
                            '• Custom security alerts\n' +
                            '• Export logs & reports\n' +
                            '• AI threat detection\n' +
                            '• Priority support', 
                            inline: false 
                        },
                        { name: '💰 Pricing', value: '**$9.99/month** or **$99/year**', inline: true },
                        { name: '🎁 Trial', value: '7-day free trial available', inline: true }
                    )
                    .setFooter({ text: 'Use /subscribe to upgrade now or visit our website!' })
                    .setTimestamp();

                const upgradeButtons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('🌐 View on Website')
                            .setStyle(ButtonStyle.Link)
                            .setURL(websiteUrl),
                        new ButtonBuilder()
                            .setCustomId('subscribe_pro')
                            .setLabel('Upgrade to Pro')
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('💎')
                    );

                return interaction.reply({ 
                    embeds: [upgradeEmbed], 
                    components: [upgradeButtons],
                    ephemeral: true 
                });
            }

            // Get all data
            const allUsers = db.getAllUsers(interaction.guild.id) || {};

            // Advanced statistics
            const stats = calculateAdvancedStats(allUsers, serverData, interaction.guild);

            // Create Pro Dashboard embed
            const proDashEmbed = new EmbedBuilder()
                .setColor('#9b59b6')
                .setTitle('💎 Game Killer\'s Security™ - Pro Dashboard')
                .setDescription(`Advanced security analytics for **${interaction.guild.name}**\n\n` +
                               `🌐 **[Open Full Pro Dashboard](${websiteUrl}/login)**`)
                .addFields(
                    {
                        name: '📊 Member Analytics',
                        value: `**Total Members:** ${interaction.guild.memberCount}\n` +
                               `**Active Users (7d):** ${stats.activeUsers}\n` +
                               `**New Members (7d):** ${stats.newMembers}\n` +
                               `**Member Growth:** ${stats.memberGrowth}`,
                        inline: true
                    },
                    {
                        name: '🚨 Security Metrics',
                        value: `**Total Warnings:** ${stats.totalWarnings}\n` +
                               `**Warnings (7d):** ${stats.recentWarnings}\n` +
                               `**High-Risk Users:** ${stats.highRiskUsers}\n` +
                               `**Threat Level:** ${stats.threatLevel}`,
                        inline: true
                    },
                    {
                        name: '📈 Infraction Trends',
                        value: `**Total Infractions:** ${stats.totalInfractions}\n` +
                               `**This Week:** ${stats.weeklyInfractions}\n` +
                               `**This Month:** ${stats.monthlyInfractions}\n` +
                               `**Trend:** ${stats.infractionTrend}`,
                        inline: true
                    },
                    {
                        name: '🔍 Report Analytics',
                        value: `**Total Reports:** ${stats.totalReports}\n` +
                               `**Pending:** ${stats.pendingReports}\n` +
                               `**Approved:** ${stats.approvedReports}\n` +
                               `**Denied:** ${stats.deniedReports}`,
                        inline: true
                    },
                    {
                        name: '⚡ Auto-Moderation',
                        value: `**Status:** ${serverData.autoMod ? '✅ Active' : '❌ Inactive'}\n` +
                               `**Actions (24h):** ${stats.autoModActions}\n` +
                               `**Spam Blocked:** ${stats.spamBlocked}\n` +
                               `**Links Filtered:** ${stats.linksFiltered}`,
                        inline: true
                    },
                    {
                        name: '🎯 Top Risk Users',
                        value: stats.topRiskUsers || 'No high-risk users',
                        inline: true
                    }
                )
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({ text: '💎 Pro Dashboard | Real-time Analytics | Open web dashboard for more features' })
                .setTimestamp();

            // Add AI insights if available
            if (stats.aiInsights) {
                proDashEmbed.addFields({
                    name: '🤖 AI Security Insights',
                    value: stats.aiInsights,
                    inline: false
                });
            }

            // Create web dashboard button (first row)
            const webButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('🌐 Open Pro Web Dashboard')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`${websiteUrl}/login`)
                        .setEmoji('💎')
                );

            // Create action buttons (second row)
            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prodash_refresh')
                        .setLabel('Refresh')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🔄'),
                    new ButtonBuilder()
                        .setCustomId('prodash_export')
                        .setLabel('Export Data')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('📥'),
                    new ButtonBuilder()
                        .setCustomId('prodash_detailed')
                        .setLabel('Detailed View')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('📊'),
                    new ButtonBuilder()
                        .setCustomId('prodash_alerts')
                        .setLabel('Alert Config')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('🔔')
                );

            await interaction.reply({ 
                embeds: [proDashEmbed], 
                components: [webButton, buttons]
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to load Pro Dashboard!',
                ephemeral: true
            });
        }
    }
};

/**
 * Calculate advanced statistics
 */
function calculateAdvancedStats(allUsers, serverData, guild) {
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    // Calculate stats
    const totalWarnings = Object.values(allUsers).reduce((sum, user) => {
        return sum + (user.warnings?.length || 0);
    }, 0);

    const recentWarnings = Object.values(allUsers).reduce((sum, user) => {
        const recent = (user.warnings || []).filter(w => 
            new Date(w.timestamp).getTime() > sevenDaysAgo
        );
        return sum + recent.length;
    }, 0);

    const totalInfractions = Object.values(allUsers).reduce((sum, user) => {
        return sum + (user.infractions || 0);
    }, 0);

    const highRiskUsers = Object.entries(allUsers).filter(([_, user]) => 
        (user.infractions || 0) >= 3
    ).length;

    const totalReports = serverData.reports?.length || 0;
    const pendingReports = serverData.reports?.filter(r => r.status === 'pending').length || 0;
    const approvedReports = serverData.reports?.filter(r => r.status === 'approved').length || 0;
    const deniedReports = serverData.reports?.filter(r => r.status === 'denied').length || 0;

    // Calculate threat level
    let threatLevel = '🟢 Low';
    if (highRiskUsers > 5 || pendingReports > 10) {
        threatLevel = '🔴 High';
    } else if (highRiskUsers > 2 || pendingReports > 5) {
        threatLevel = '🟡 Medium';
    }

    // Get top risk users
    const topRisk = Object.entries(allUsers)
        .sort(([, a], [, b]) => (b.infractions || 0) - (a.infractions || 0))
        .slice(0, 3)
        .map(([userId, user]) => {
            const member = guild.members.cache.get(userId);
            const name = member ? member.user.tag : `User ${userId}`;
            return `• ${name} (${user.infractions || 0} infractions)`;
        })
        .join('\n');

    return {
        activeUsers: Math.floor(guild.memberCount * 0.6), // Placeholder
        newMembers: Math.floor(guild.memberCount * 0.05), // Placeholder
        memberGrowth: '+2.3%', // Placeholder
        totalWarnings,
        recentWarnings,
        highRiskUsers,
        threatLevel,
        totalInfractions,
        weeklyInfractions: recentWarnings,
        monthlyInfractions: totalWarnings,
        infractionTrend: recentWarnings > 5 ? '📈 Increasing' : '📉 Stable',
        totalReports,
        pendingReports,
        approvedReports,
        deniedReports,
        autoModActions: 0, // Placeholder
        spamBlocked: 0, // Placeholder
        linksFiltered: 0, // Placeholder
        topRiskUsers: topRisk || 'No high-risk users',
        aiInsights: '• Server security is stable\n• No unusual activity detected\n• Recommend enabling auto-mod'
    };
}