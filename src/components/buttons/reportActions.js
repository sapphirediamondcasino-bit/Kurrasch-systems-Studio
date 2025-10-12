const { EmbedBuilder } = require('discord.js');
const db = require('../../database/db');
const { EMOJIS, COLORS } = require('../../utils/constants');

module.exports = {
    name: 'reportActions',
    
    async execute(interaction) {
        // Parse button ID format: report_<action>_<reportId>
        const parts = interaction.customId.split('_');
        
        if (parts.length < 3) {
            return interaction.reply({
                content: '❌ Invalid button configuration!',
                ephemeral: true
            });
        }

        const action = parts[1]; // 'approve' or 'deny'
        const reportId = parts[2];

        try {
            const serverData = db.getServer(interaction.guild.id) || {};
            
            if (!serverData.reports || serverData.reports.length === 0) {
                return interaction.reply({
                    content: '❌ No reports found!',
                    ephemeral: true
                });
            }

            // Find the report
            const reportIndex = serverData.reports.findIndex(r => r.id === reportId);
            
            if (reportIndex === -1) {
                return interaction.reply({
                    content: '❌ Report not found! It may have been deleted.',
                    ephemeral: true
                });
            }

            const report = serverData.reports[reportIndex];

            // Check if report is already processed
            if (report.status !== 'pending') {
                return interaction.reply({
                    content: `⚠️ This report has already been ${report.status}!`,
                    ephemeral: true
                });
            }

            if (action === 'approve') {
                await handleApprove(interaction, report, serverData, reportIndex);
            } else if (action === 'deny') {
                await handleDeny(interaction, report, serverData, reportIndex);
            } else {
                return interaction.reply({
                    content: '❌ Unknown action!',
                    ephemeral: true
                });
            }

        } catch (error) {
            console.error('Error handling report action:', error);
            await interaction.reply({
                content: '❌ Failed to process report action!',
                ephemeral: true
            });
        }
    }
};

/**
 * Approve a report
 */
async function handleApprove(interaction, report, serverData, reportIndex) {
    // Update report status
    serverData.reports[reportIndex].status = 'approved';
    serverData.reports[reportIndex].reviewedBy = interaction.user.id;
    serverData.reports[reportIndex].reviewedAt = new Date().toISOString();

    db.saveServer(interaction.guild.id, serverData);

    // Get reported user
    const reportedUser = await interaction.client.users.fetch(report.reportedUser).catch(() => null);
    const reporter = await interaction.client.users.fetch(report.reporter).catch(() => null);

    // Create approved embed
    const approveEmbed = new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle(`${EMOJIS.SUCCESS} Report Approved`)
        .setDescription(`Report #${report.id} has been approved.`)
        .addFields(
            { 
                name: '👤 Reported User', 
                value: reportedUser ? `${reportedUser.tag} (${reportedUser.id})` : `User ID: ${report.reportedUser}`, 
                inline: true 
            },
            { 
                name: '👮 Reviewed By', 
                value: interaction.user.tag, 
                inline: true 
            },
            { 
                name: '📝 Reason', 
                value: report.reason, 
                inline: false 
            },
            {
                name: '💡 Next Steps',
                value: 'Consider taking moderation action against the reported user using:\n' +
                       '• `/warn` - Issue a warning\n' +
                       '• `/timeout` - Timeout the user\n' +
                       '• `/kick` - Kick from server\n' +
                       '• `/ban` - Ban from server',
                inline: false
            }
        )
        .setFooter({ text: `Report ID: ${report.id}` })
        .setTimestamp();

    // Update the original message
    await interaction.update({ 
        embeds: [approveEmbed], 
        components: [] // Remove buttons
    });

    // Notify reporter if possible
    if (reporter) {
        try {
            const reporterEmbed = new EmbedBuilder()
                .setColor(COLORS.SUCCESS)
                .setTitle(`${EMOJIS.SUCCESS} Your Report Was Approved`)
                .setDescription(`Your report in **${interaction.guild.name}** has been reviewed and approved.`)
                .addFields(
                    { name: '📝 Report ID', value: report.id, inline: true },
                    { name: '👤 Reported User', value: reportedUser ? reportedUser.tag : 'Unknown', inline: true },
                    { name: '📋 Reason', value: report.reason, inline: false },
                    { name: '✅ Status', value: 'Approved - Action will be taken', inline: false }
                )
                .setFooter({ text: 'Thank you for helping keep the server safe!' })
                .setTimestamp();

            await reporter.send({ embeds: [reporterEmbed] });
        } catch {
            // User has DMs disabled, ignore
        }
    }

    console.log(`✅ Report ${report.id} approved by ${interaction.user.tag}`);
}

/**
 * Deny a report
 */
async function handleDeny(interaction, report, serverData, reportIndex) {
    // Update report status
    serverData.reports[reportIndex].status = 'denied';
    serverData.reports[reportIndex].reviewedBy = interaction.user.id;
    serverData.reports[reportIndex].reviewedAt = new Date().toISOString();

    db.saveServer(interaction.guild.id, serverData);

    // Get users
    const reportedUser = await interaction.client.users.fetch(report.reportedUser).catch(() => null);
    const reporter = await interaction.client.users.fetch(report.reporter).catch(() => null);

    // Create denied embed
    const denyEmbed = new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setTitle(`${EMOJIS.ERROR} Report Denied`)
        .setDescription(`Report #${report.id} has been denied.`)
        .addFields(
            { 
                name: '👤 Reported User', 
                value: reportedUser ? `${reportedUser.tag} (${reportedUser.id})` : `User ID: ${report.reportedUser}`, 
                inline: true 
            },
            { 
                name: '👮 Reviewed By', 
                value: interaction.user.tag, 
                inline: true 
            },
            { 
                name: '📝 Original Reason', 
                value: report.reason, 
                inline: false 
            },
            {
                name: 'ℹ️ Note',
                value: 'This report was reviewed and determined to not require action.\n' +
                       'The reported user will not be penalized.',
                inline: false
            }
        )
        .setFooter({ text: `Report ID: ${report.id}` })
        .setTimestamp();

    // Update the original message
    await interaction.update({ 
        embeds: [denyEmbed], 
        components: [] // Remove buttons
    });

    // Notify reporter if possible
    if (reporter) {
        try {
            const reporterEmbed = new EmbedBuilder()
                .setColor(COLORS.WARNING)
                .setTitle(`${EMOJIS.WARNING} Your Report Was Denied`)
                .setDescription(`Your report in **${interaction.guild.name}** has been reviewed.`)
                .addFields(
                    { name: '📝 Report ID', value: report.id, inline: true },
                    { name: '👤 Reported User', value: reportedUser ? reportedUser.tag : 'Unknown', inline: true },
                    { name: '📋 Reason', value: report.reason, inline: false },
                    { name: '❌ Status', value: 'Denied - No action required', inline: false },
                    { name: 'ℹ️ Note', value: 'After review, this report did not meet the criteria for moderation action.', inline: false }
                )
                .setFooter({ text: 'Thank you for your report' })
                .setTimestamp();

            await reporter.send({ embeds: [reporterEmbed] });
        } catch {
            // User has DMs disabled, ignore
        }
    }

    console.log(`❌ Report ${report.id} denied by ${interaction.user.tag}`);
}