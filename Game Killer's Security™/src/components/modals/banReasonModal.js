const { EmbedBuilder } = require('discord.js');
const db = require('../../database/db');
const { EMOJIS, COLORS } = require('../../utils/constants');

module.exports = {
    name: 'banReasonModal',
    
    async execute(interaction) {
        try {
            // Get form data
            const targetUserId = interaction.customId.split('_')[3]; // Format: ban_reason_modal_<userId>
            const reason = interaction.fields.getTextInputValue('ban_reason');
            const duration = interaction.fields.getTextInputValue('ban_duration') || 'Permanent';
            const additionalNotes = interaction.fields.getTextInputValue('ban_notes') || 'None';

            // Fetch the target user
            const targetUser = await interaction.client.users.fetch(targetUserId).catch(() => null);

            if (!targetUser) {
                return interaction.reply({
                    content: '❌ Could not find the user to ban!',
                    ephemeral: true
                });
            }

            const member = interaction.guild.members.cache.get(targetUserId);

            if (!member) {
                return interaction.reply({
                    content: '❌ User not found in this server!',
                    ephemeral: true
                });
            }

            // Check if user can be banned
            if (!member.bannable) {
                return interaction.reply({
                    content: '❌ I cannot ban this user! They may have higher permissions than me.',
                    ephemeral: true
                });
            }

            if (targetUser.id === interaction.user.id) {
                return interaction.reply({
                    content: '❌ You cannot ban yourself!',
                    ephemeral: true
                });
            }

            // Validate reason
            if (reason.length < 5) {
                return interaction.reply({
                    content: '❌ Ban reason must be at least 5 characters long!',
                    ephemeral: true
                });
            }

            await interaction.deferReply();

            try {
                // Execute the ban
                await member.ban({ 
                    reason: `${reason} | Banned by ${interaction.user.tag} | Duration: ${duration}`,
                    deleteMessageSeconds: 7 * 24 * 60 * 60 // Delete messages from last 7 days
                });

                // Save ban to database
                const userData = db.getUser(interaction.guild.id, targetUserId) || {
                    userId: targetUserId,
                    warnings: [],
                    infractions: 0
                };

                if (!userData.bans) userData.bans = [];
                
                userData.bans.push({
                    id: Date.now().toString(),
                    reason: reason,
                    duration: duration,
                    notes: additionalNotes,
                    moderator: interaction.user.id,
                    timestamp: new Date().toISOString()
                });

                userData.infractions = (userData.infractions || 0) + 1;
                db.saveUser(interaction.guild.id, targetUserId, userData);

                // Create success embed
                const banEmbed = new EmbedBuilder()
                    .setColor(COLORS.ERROR)
                    .setTitle(`${EMOJIS.BAN} User Banned Successfully`)
                    .setDescription(`**${targetUser.tag}** has been banned from the server.`)
                    .addFields(
                        { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                        { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                        { name: '⏱️ Duration', value: duration, inline: true },
                        { name: '📝 Reason', value: reason, inline: false },
                        { name: '📋 Additional Notes', value: additionalNotes, inline: false },
                        { name: '🗑️ Messages Deleted', value: 'Last 7 days', inline: true },
                        { name: '📊 Total Infractions', value: `${userData.infractions}`, inline: true }
                    )
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: `Ban ID: ${userData.bans[userData.bans.length - 1].id}` })
                    .setTimestamp();

                await interaction.editReply({ embeds: [banEmbed] });

                // Try to DM the user
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setColor(COLORS.ERROR)
                        .setTitle(`${EMOJIS.BAN} You have been banned`)
                        .setDescription(`You have been banned from **${interaction.guild.name}**`)
                        .addFields(
                            { name: '📝 Reason', value: reason, inline: false },
                            { name: '⏱️ Duration', value: duration, inline: true },
                            { name: '📅 Banned On', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                        )
                        .setFooter({ text: 'If you believe this was a mistake, contact the server moderators' })
                        .setTimestamp();

                    await targetUser.send({ embeds: [dmEmbed] });
                } catch {
                    // User has DMs disabled or bot blocked, ignore
                }

                // Log to mod channel if configured
                const serverData = db.getServer(interaction.guild.id) || {};
                
                if (serverData.logChannel) {
                    const logChannel = interaction.guild.channels.cache.get(serverData.logChannel);
                    
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setColor(COLORS.ERROR)
                            .setTitle(`${EMOJIS.BAN} Member Banned`)
                            .setDescription(`${targetUser.tag} was banned from the server`)
                            .addFields(
                                { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                                { name: '👮 Moderator', value: `${interaction.user.tag}`, inline: true },
                                { name: '⏱️ Duration', value: duration, inline: true },
                                { name: '📝 Reason', value: reason, inline: false },
                                { name: '📋 Notes', value: additionalNotes, inline: false }
                            )
                            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                            .setTimestamp();

                        await logChannel.send({ embeds: [logEmbed] });
                    }
                }

                console.log(`🔨 ${interaction.user.tag} banned ${targetUser.tag} - Reason: ${reason}`);

            } catch (error) {
                console.error('Error executing ban:', error);
                await interaction.editReply({
                    content: '❌ Failed to ban user! Please check my permissions and try again.'
                });
            }

        } catch (error) {
            console.error('Error handling ban modal:', error);
            
            if (interaction.deferred) {
                await interaction.editReply({
                    content: '❌ Failed to process ban! Please try again.'
                });
            } else {
                await interaction.reply({
                    content: '❌ Failed to process ban! Please try again.',
                    ephemeral: true
                }).catch(() => {});
            }
        }
    }
};