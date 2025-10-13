const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dashboard')
        .setDescription('📊 View server security dashboard'),
    
    async execute(interaction) {
        try {
            // Get server data
            const serverData = db.getServer(interaction.guild.id) || {};
            const allUsers = db.getAllUsers(interaction.guild.id) || {};

            // Calculate statistics
            const totalWarnings = Object.values(allUsers).reduce((sum, user) => {
                return sum + (user.warnings?.length || 0);
            }, 0);

            const totalInfractions = Object.values(allUsers).reduce((sum, user) => {
                return sum + (user.infractions || 0);
            }, 0);

            const totalReports = serverData.reports?.length || 0;
            const pendingReports = serverData.reports?.filter(r => r.status === 'pending').length || 0;

            // Get high-risk users
            const highRiskUsers = Object.entries(allUsers)
                .filter(([_, user]) => (user.infractions || 0) >= 3)
                .length;

            // Get recent activity
            const recentWarnings = Object.values(allUsers)
                .flatMap(user => user.warnings || [])
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 5);

            // Get website URL from environment or use default
            const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:25974';

            // Create main dashboard embed
            const dashboardEmbed = new EmbedBuilder()
                .setColor('#00d9ff')
                .setTitle('🛡️ Game Killer\'s Security™ - Server Dashboard')
                .setDescription(`Security overview for **${interaction.guild.name}**\n\n` +
                               `🌐 **[Open Full Web Dashboard](${websiteUrl})**`)
                .addFields(
                    {
                        name: '📊 Overview Statistics',
                        value: `**Total Members:** ${interaction.guild.memberCount}\n` +
                               `**Total Warnings:** ${totalWarnings}\n` +
                               `**Total Infractions:** ${totalInfractions}\n` +
                               `**Pending Reports:** ${pendingReports}`,
                        inline: true
                    },
                    {
                        name: '🚨 Security Status',
                        value: `**High-Risk Users:** ${highRiskUsers}\n` +
                               `**Total Reports:** ${totalReports}\n` +
                               `**Auto-Mod:** ${serverData.autoMod ? '✅ Enabled' : '❌ Disabled'}\n` +
                               `**Security Level:** ${serverData.securityLevel || 'Medium'}`,
                        inline: true
                    },
                    {
                        name: '💎 Subscription',
                        value: `**Current Tier:** ${serverData.tier || 'Free'}\n` +
                               `**Features Unlocked:** ${getTierFeatureCount(serverData.tier)}\n` +
                               `**Status:** ${serverData.tier === 'Free' ? '⬆️ Upgrade Available' : '✅ Active'}`,
                        inline: false
                    }
                )
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({ text: 'Game Killer\'s Security™ | Use buttons below or open web dashboard' })
                .setTimestamp();

            // Add recent activity if exists
            if (recentWarnings.length > 0) {
                const recentActivity = recentWarnings
                    .slice(0, 3)
                    .map(w => {
                        const timestamp = new Date(w.timestamp);
                        return `• ${w.reason.substring(0, 40)}... (<t:${Math.floor(timestamp.getTime() / 1000)}:R>)`;
                    })
                    .join('\n');

                dashboardEmbed.addFields({
                    name: '📋 Recent Activity',
                    value: recentActivity || 'No recent activity',
                    inline: false
                });
            }

            // Create web dashboard button (always first)
            const webButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('🌐 Open Web Dashboard')
                        .setStyle(ButtonStyle.Link)
                        .setURL(websiteUrl)
                        .setEmoji('🖥️')
                );

            // Create navigation buttons
            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('dashboard_refresh')
                        .setLabel('Refresh')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🔄'),
                    new ButtonBuilder()
                        .setCustomId('dashboard_reports')
                        .setLabel('View Reports')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('📋'),
                    new ButtonBuilder()
                        .setCustomId('dashboard_users')
                        .setLabel('User List')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('👥'),
                    new ButtonBuilder()
                        .setCustomId('dashboard_settings')
                        .setLabel('Settings')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('⚙️')
                );

            // Create upgrade button if on free tier
            const upgradeRow = new ActionRowBuilder();
            if (!serverData.tier || serverData.tier === 'Free') {
                upgradeRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId('dashboard_upgrade')
                        .setLabel('⬆️ Upgrade to Pro')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('💎')
                );
            }

            // Build components array (web button always first)
            const components = [webButton, buttons];
            if (!serverData.tier || serverData.tier === 'Free') {
                components.push(upgradeRow);
            }

            await interaction.reply({ 
                embeds: [dashboardEmbed], 
                components: components
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to load dashboard!',
                ephemeral: true
            });
        }
    }
};

/**
 * Get number of features unlocked for a tier
 */
function getTierFeatureCount(tier) {
    const features = {
        'Free': '5',
        'Basic': '10',
        'Pro': '20',
        'Enterprise': 'Unlimited'
    };
    return features[tier] || features['Free'];
}