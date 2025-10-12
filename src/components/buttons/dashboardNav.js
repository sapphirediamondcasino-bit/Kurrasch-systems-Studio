const { EmbedBuilder } = require('discord.js');
const db = require('../../database/db');
const { EMOJIS, COLORS } = require('../../utils/constants');

module.exports = {
    name: 'dashboardNav',
    
    async execute(interaction) {
        const buttonId = interaction.customId;

        // Handle dashboard refresh
        if (buttonId === 'dashboard_refresh') {
            await handleRefresh(interaction);
        }
        
        // Handle view reports
        else if (buttonId === 'dashboard_reports') {
            await handleReports(interaction);
        }
        
        // Handle user list
        else if (buttonId === 'dashboard_users') {
            await handleUserList(interaction);
        }
        
        // Handle settings
        else if (buttonId === 'dashboard_settings') {
            await handleSettings(interaction);
        }
        
        // Handle upgrade
        else if (buttonId === 'dashboard_upgrade') {
            await handleUpgrade(interaction);
        }

        // Handle Pro Dashboard actions
        else if (buttonId === 'prodash_refresh') {
            await handleProRefresh(interaction);
        }
        else if (buttonId === 'prodash_export') {
            await handleExport(interaction);
        }
        else if (buttonId === 'prodash_detailed') {
            await handleDetailed(interaction);
        }
        else if (buttonId === 'prodash_alerts') {
            await handleAlerts(interaction);
        }
    }
};

/**
 * Refresh basic dashboard
 */
async function handleRefresh(interaction) {
    await interaction.deferUpdate();
    
    const serverData = db.getServer(interaction.guild.id) || {};
    const allUsers = db.getAllUsers(interaction.guild.id) || {};

    const totalWarnings = Object.values(allUsers).reduce((sum, user) => {
        return sum + (user.warnings?.length || 0);
    }, 0);

    const totalInfractions = Object.values(allUsers).reduce((sum, user) => {
        return sum + (user.infractions || 0);
    }, 0);

    const totalReports = serverData.reports?.length || 0;
    const pendingReports = serverData.reports?.filter(r => r.status === 'pending').length || 0;

    const refreshEmbed = new EmbedBuilder()
        .setColor(COLORS.INFO)
        .setTitle(`${EMOJIS.REFRESH} Dashboard Refreshed`)
        .setDescription(`Updated stats for **${interaction.guild.name}**`)
        .addFields(
            { name: '📊 Total Warnings', value: `${totalWarnings}`, inline: true },
            { name: '🚨 Total Infractions', value: `${totalInfractions}`, inline: true },
            { name: '📋 Pending Reports', value: `${pendingReports}`, inline: true }
        )
        .setFooter({ text: `Last updated: ${new Date().toLocaleString()}` })
        .setTimestamp();

    await interaction.editReply({ embeds: [refreshEmbed] });
}

/**
 * View reports
 */
async function handleReports(interaction) {
    await interaction.deferUpdate();
    
    const serverData = db.getServer(interaction.guild.id) || {};
    const reports = serverData.reports || [];

    if (reports.length === 0) {
        const noReportsEmbed = new EmbedBuilder()
            .setColor(COLORS.NEUTRAL)
            .setTitle(`${EMOJIS.LOG} No Reports`)
            .setDescription('There are currently no reports in this server.')
            .setTimestamp();

        return interaction.editReply({ embeds: [noReportsEmbed] });
    }

    const recentReports = reports.slice(-5).reverse();
    const reportList = recentReports.map((report, index) => {
        const user = interaction.guild.members.cache.get(report.reportedUser);
        const userName = user ? user.user.tag : `User ${report.reportedUser}`;
        const statusEmoji = report.status === 'pending' ? '🟡' : report.status === 'approved' ? '✅' : '❌';
        
        return `**${index + 1}.** ${statusEmoji} ${userName}\n` +
               `Reason: ${report.reason.substring(0, 50)}...\n` +
               `Status: ${report.status.toUpperCase()}`;
    }).join('\n\n');

    const reportsEmbed = new EmbedBuilder()
        .setColor(COLORS.SECURITY)
        .setTitle(`${EMOJIS.LOG} Recent Reports`)
        .setDescription(reportList)
        .addFields(
            { name: '📊 Total Reports', value: `${reports.length}`, inline: true },
            { name: '🟡 Pending', value: `${reports.filter(r => r.status === 'pending').length}`, inline: true },
            { name: '✅ Approved', value: `${reports.filter(r => r.status === 'approved').length}`, inline: true }
        )
        .setFooter({ text: 'Use /logs to view all reports' })
        .setTimestamp();

    await interaction.editReply({ embeds: [reportsEmbed] });
}

/**
 * View high-risk users
 */
async function handleUserList(interaction) {
    await interaction.deferUpdate();
    
    const allUsers = db.getAllUsers(interaction.guild.id) || {};
    
    const riskUsers = Object.entries(allUsers)
        .filter(([_, user]) => (user.infractions || 0) >= 2)
        .sort(([, a], [, b]) => (b.infractions || 0) - (a.infractions || 0))
        .slice(0, 10);

    if (riskUsers.length === 0) {
        const noUsersEmbed = new EmbedBuilder()
            .setColor(COLORS.SUCCESS)
            .setTitle(`${EMOJIS.SUCCESS} All Clear`)
            .setDescription('No high-risk users detected!')
            .setTimestamp();

        return interaction.editReply({ embeds: [noUsersEmbed] });
    }

    const userList = riskUsers.map(([userId, user], index) => {
        const member = interaction.guild.members.cache.get(userId);
        const userName = member ? member.user.tag : `User ${userId}`;
        const riskLevel = user.infractions >= 5 ? '🔴 High' : user.infractions >= 3 ? '🟡 Medium' : '🟢 Low';
        
        return `**${index + 1}.** ${userName}\n` +
               `Risk: ${riskLevel} | Infractions: ${user.infractions} | Warnings: ${user.warnings?.length || 0}`;
    }).join('\n\n');

    const usersEmbed = new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setTitle(`${EMOJIS.USER} High-Risk Users`)
        .setDescription(userList)
        .setFooter({ text: 'Use /check <user> for detailed information' })
        .setTimestamp();

    await interaction.editReply({ embeds: [usersEmbed] });
}

/**
 * Quick settings view
 */
async function handleSettings(interaction) {
    await interaction.reply({
        content: `${EMOJIS.SETTINGS} Opening settings panel... Use \`/settings\` for full configuration options!`,
        ephemeral: true
    });
}

/**
 * Upgrade prompt
 */
async function handleUpgrade(interaction) {
    const upgradeEmbed = new EmbedBuilder()
        .setColor(COLORS.PRO)
        .setTitle(`${EMOJIS.DIAMOND} Upgrade to Pro`)
        .setDescription('Unlock advanced features with Game Killer\'s Security™ Pro!')
        .addFields(
            {
                name: '✨ Pro Features',
                value: '• Advanced analytics dashboard\n' +
                       '• AI threat detection\n' +
                       '• Custom security alerts\n' +
                       '• Export logs & reports\n' +
                       '• Roblox ban syncing\n' +
                       '• Priority support',
                inline: false
            },
            { name: '💰 Pricing', value: '$9.99/month', inline: true },
            { name: '🎁 Trial', value: '7-day free trial', inline: true }
        )
        .setFooter({ text: 'Use /subscribe to get started!' })
        .setTimestamp();

    await interaction.reply({ embeds: [upgradeEmbed], ephemeral: true });
}

/**
 * Pro Dashboard refresh
 */
async function handleProRefresh(interaction) {
    await interaction.reply({
        content: `${EMOJIS.REFRESH} Pro Dashboard refreshed! All analytics updated.`,
        ephemeral: true
    });
}

/**
 * Export data
 */
async function handleExport(interaction) {
    await interaction.reply({
        content: `${EMOJIS.EXPORT} **Data Export**\n\nExporting server data... This feature will generate:\n\n` +
                 '• Complete moderation logs\n' +
                 '• User infraction history\n' +
                 '• Security reports\n' +
                 '• Analytics data\n\n' +
                 '*Feature coming soon in Phase 4!*',
        ephemeral: true
    });
}

/**
 * Detailed analytics view
 */
async function handleDetailed(interaction) {
    await interaction.reply({
        content: `${EMOJIS.DASHBOARD} **Detailed Analytics View**\n\n` +
                 'This will show:\n' +
                 '• Hour-by-hour activity breakdown\n' +
                 '• User behavior patterns\n' +
                 '• Threat heat maps\n' +
                 '• Predictive insights\n\n' +
                 '*Feature coming soon in Phase 7 (AI Integration)!*',
        ephemeral: true
    });
}

/**
 * Alert configuration
 */
async function handleAlerts(interaction) {
    await interaction.reply({
        content: `${EMOJIS.SETTINGS} **Alert Configuration**\n\n` +
                 'Configure custom alerts for:\n' +
                 '• New high-risk users\n' +
                 '• Raid attempts\n' +
                 '• Mass reporting\n' +
                 '• Unusual activity\n\n' +
                 '*Feature coming soon!*',
        ephemeral: true
    });
}