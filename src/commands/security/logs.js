const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('📋 View security logs and moderation history')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Type of logs to view')
                .setRequired(false)
                .addChoices(
                    { name: 'All Logs', value: 'all' },
                    { name: 'Warnings', value: 'warnings' },
                    { name: 'Reports', value: 'reports' },
                    { name: 'Bans', value: 'bans' },
                    { name: 'Kicks', value: 'kicks' }
                ))
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Filter logs by specific user')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        const logType = interaction.options.getString('type') || 'all';
        const targetUser = interaction.options.getUser('user');

        await interaction.deferReply({ ephemeral: true });

        try {
            const serverData = db.getServer(interaction.guild.id) || {};
            const allUsers = db.getAllUsers(interaction.guild.id) || {};

            // Collect all logs
            let logs = [];

            // Get warnings
            if (logType === 'all' || logType === 'warnings') {
                Object.entries(allUsers).forEach(([userId, userData]) => {
                    if (userData.warnings && userData.warnings.length > 0) {
                        userData.warnings.forEach(warning => {
                            if (!targetUser || userId === targetUser.id) {
                                logs.push({
                                    type: 'warning',
                                    userId: userId,
                                    data: warning,
                                    timestamp: new Date(warning.timestamp)
                                });
                            }
                        });
                    }
                });
            }

            // Get reports
            if (logType === 'all' || logType === 'reports') {
                if (serverData.reports && serverData.reports.length > 0) {
                    serverData.reports.forEach(report => {
                        if (!targetUser || report.reportedUser === targetUser.id || report.reporter === targetUser.id) {
                            logs.push({
                                type: 'report',
                                data: report,
                                timestamp: new Date(report.timestamp)
                            });
                        }
                    });
                }
            }

            // Sort logs by timestamp (newest first)
            logs.sort((a, b) => b.timestamp - a.timestamp);

            // Limit to recent 10 logs
            logs = logs.slice(0, 10);

            if (logs.length === 0) {
                const noLogsEmbed = new EmbedBuilder()
                    .setColor('#808080')
                    .setTitle('📋 Security Logs')
                    .setDescription('No logs found matching your criteria.')
                    .setTimestamp();

                return interaction.editReply({ embeds: [noLogsEmbed] });
            }

            // Build log entries
            const logEntries = logs.map((log, index) => {
                const timestamp = `<t:${Math.floor(log.timestamp.getTime() / 1000)}:R>`;
                
                if (log.type === 'warning') {
                    const user = interaction.guild.members.cache.get(log.userId);
                    const userName = user ? user.user.tag : `User ${log.userId}`;
                    const mod = interaction.guild.members.cache.get(log.data.moderator);
                    const modName = mod ? mod.user.tag : 'Unknown';
                    
                    return `**${index + 1}. ⚠️ Warning**\n` +
                           `User: ${userName}\n` +
                           `Reason: ${log.data.reason}\n` +
                           `By: ${modName} • ${timestamp}`;
                }
                
                if (log.type === 'report') {
                    const reportedUser = interaction.guild.members.cache.get(log.data.reportedUser);
                    const reportedName = reportedUser ? reportedUser.user.tag : `User ${log.data.reportedUser}`;
                    const reporter = interaction.guild.members.cache.get(log.data.reporter);
                    const reporterName = reporter ? reporter.user.tag : 'Unknown';
                    
                    return `**${index + 1}. 🚨 Report [${log.data.status.toUpperCase()}]**\n` +
                           `Reported: ${reportedName}\n` +
                           `Reason: ${log.data.reason}\n` +
                           `By: ${reporterName} • ${timestamp}`;
                }
                
                return `**${index + 1}.** Unknown log type`;
            }).join('\n\n');

            const logsEmbed = new EmbedBuilder()
                .setColor('#00d9ff')
                .setTitle('📋 Security Logs')
                .setDescription(
                    `**Filter:** ${logType === 'all' ? 'All Types' : logType.charAt(0).toUpperCase() + logType.slice(1)}\n` +
                    (targetUser ? `**User:** ${targetUser.tag}\n` : '') +
                    `**Showing:** ${logs.length} most recent logs\n\n` +
                    logEntries
                )
                .setFooter({ text: `Total logs found: ${logs.length}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [logsEmbed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: '❌ Failed to retrieve security logs!',
            });
        }
    }
};