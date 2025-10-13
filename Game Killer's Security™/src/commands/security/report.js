const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('🚨 Report a user for misconduct')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to report')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the report')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('evidence')
                .setDescription('Evidence (message link, screenshot link, etc.)')
                .setRequired(false)),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const evidence = interaction.options.getString('evidence') || 'No evidence provided';

        if (targetUser.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ You cannot report yourself!',
                ephemeral: true
            });
        }

        if (targetUser.bot) {
            return interaction.reply({
                content: '❌ You cannot report bots!',
                ephemeral: true
            });
        }

        try {
            // Create report data
            const reportId = Date.now().toString();
            const report = {
                id: reportId,
                reportedUser: targetUser.id,
                reporter: interaction.user.id,
                reason: reason,
                evidence: evidence,
                status: 'pending',
                timestamp: new Date().toISOString(),
                guildId: interaction.guild.id
            };

            // Save report to database
            const serverData = db.getServer(interaction.guild.id) || { reports: [] };
            if (!serverData.reports) serverData.reports = [];
            serverData.reports.push(report);
            db.saveServer(interaction.guild.id, serverData);

            // Send confirmation to reporter
            const reportEmbed = new EmbedBuilder()
                .setColor('#ff6600')
                .setTitle('🚨 Report Submitted')
                .setDescription('Your report has been submitted to the moderation team.')
                .addFields(
                    { name: '👤 Reported User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                    { name: '📝 Report ID', value: reportId, inline: true },
                    { name: '📋 Reason', value: reason, inline: false },
                    { name: '🔍 Evidence', value: evidence, inline: false },
                    { name: '⏱️ Status', value: '🟡 Pending Review', inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [reportEmbed], ephemeral: true });

            // Get server settings for report channel
            const reportChannelId = serverData.reportChannel;
            
            if (reportChannelId) {
                const reportChannel = interaction.guild.channels.cache.get(reportChannelId);
                
                if (reportChannel) {
                    const modEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('🚨 New User Report')
                        .setDescription('A new report has been submitted.')
                        .addFields(
                            { name: '👤 Reported User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                            { name: '📝 Report ID', value: reportId, inline: true },
                            { name: '👮 Reporter', value: `${interaction.user.tag}`, inline: true },
                            { name: '📋 Reason', value: reason, inline: false },
                            { name: '🔍 Evidence', value: evidence, inline: false }
                        )
                        .setTimestamp();

                    const buttons = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`report_approve_${reportId}`)
                                .setLabel('Approve')
                                .setStyle(ButtonStyle.Success)
                                .setEmoji('✅'),
                            new ButtonBuilder()
                                .setCustomId(`report_deny_${reportId}`)
                                .setLabel('Deny')
                                .setStyle(ButtonStyle.Danger)
                                .setEmoji('❌')
                        );

                    await reportChannel.send({ embeds: [modEmbed], components: [buttons] });
                }
            }

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to submit report!',
                ephemeral: true
            });
        }
    }
};