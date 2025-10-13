const { EmbedBuilder } = require('discord.js');
const db = require('../../database/db');
const { EMOJIS, COLORS } = require('../../utils/constants');

module.exports = {
    name: 'reportModal',
    
    async execute(interaction) {
        try {
            // Get form data
            const targetUserId = interaction.customId.split('_')[2]; // Format: report_modal_<userId>
            const reason = interaction.fields.getTextInputValue('report_reason');
            const evidence = interaction.fields.getTextInputValue('report_evidence') || 'No evidence provided';
            const additionalInfo = interaction.fields.getTextInputValue('report_additional') || 'None';

            // Fetch the target user
            const targetUser = await interaction.client.users.fetch(targetUserId).catch(() => null);

            if (!targetUser) {
                return interaction.reply({
                    content: '❌ Could not find the reported user!',
                    ephemeral: true
                });
            }

            // Validate reason length
            if (reason.length < 10) {
                return interaction.reply({
                    content: '❌ Report reason must be at least 10 characters long!',
                    ephemeral: true
                });
            }

            // Create report data
            const reportId = Date.now().toString();
            const report = {
                id: reportId,
                reportedUser: targetUser.id,
                reporter: interaction.user.id,
                reason: reason,
                evidence: evidence,
                additionalInfo: additionalInfo,
                status: 'pending',
                timestamp: new Date().toISOString(),
                guildId: interaction.guild.id
            };

            // Save report to database
            const serverData = db.getServer(interaction.guild.id) || {};
            if (!serverData.reports) serverData.reports = [];
            serverData.reports.push(report);
            db.saveServer(interaction.guild.id, serverData);

            // Send confirmation to reporter
            const confirmEmbed = new EmbedBuilder()
                .setColor(COLORS.SUCCESS)
                .setTitle(`${EMOJIS.SUCCESS} Report Submitted Successfully`)
                .setDescription('Your report has been submitted to the moderation team.')
                .addFields(
                    { name: '👤 Reported User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                    { name: '📝 Report ID', value: reportId, inline: true },
                    { name: '📋 Reason', value: reason.substring(0, 1000), inline: false },
                    { name: '🔍 Evidence', value: evidence.substring(0, 1000), inline: false },
                    { name: '⏱️ Status', value: '🟡 Pending Review', inline: false }
                )
                .setFooter({ text: 'You will be notified when your report is reviewed' })
                .setTimestamp();

            await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });

            // Send to moderation channel if configured
            if (serverData.reportChannel) {
                const reportChannel = interaction.guild.channels.cache.get(serverData.reportChannel);
                
                if (reportChannel) {
                    const modEmbed = new EmbedBuilder()
                        .setColor(COLORS.SECURITY)
                        .setTitle(`${EMOJIS.REPORT} New User Report`)
                        .setDescription('A new report has been submitted and requires review.')
                        .addFields(
                            { name: '👤 Reported User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                            { name: '📝 Report ID', value: reportId, inline: true },
                            { name: '👮 Reporter', value: `${interaction.user.tag}`, inline: true },
                            { name: '📋 Reason', value: reason, inline: false },
                            { name: '🔍 Evidence', value: evidence, inline: false },
                            { name: '📝 Additional Info', value: additionalInfo, inline: false }
                        )
                        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: `Report submitted by ${interaction.user.tag}` })
                        .setTimestamp();

                    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
                    
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
                                .setEmoji('❌'),
                            new ButtonBuilder()
                                .setCustomId(`report_investigate_${reportId}`)
                                .setLabel('Investigate')
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji('🔍')
                        );

                    await reportChannel.send({ embeds: [modEmbed], components: [buttons] });
                }
            }

            // Log report submission
            console.log(`🚨 Report submitted: ${interaction.user.tag} reported ${targetUser.tag} (ID: ${reportId})`);

        } catch (error) {
            console.error('Error handling report modal:', error);
            await interaction.reply({
                content: '❌ Failed to submit report! Please try again.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};