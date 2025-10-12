const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('⚠️ Warn a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to warn')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the warning')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const member = interaction.guild.members.cache.get(targetUser.id);

        if (!member) {
            return interaction.reply({
                content: '❌ User not found in this server!',
                ephemeral: true
            });
        }

        if (targetUser.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ You cannot warn yourself!',
                ephemeral: true
            });
        }

        if (targetUser.bot) {
            return interaction.reply({
                content: '❌ You cannot warn bots!',
                ephemeral: true
            });
        }

        try {
            // Get or create user data
            const userData = db.getUser(interaction.guild.id, targetUser.id) || {
                userId: targetUser.id,
                warnings: [],
                infractions: 0
            };

            // Add warning
            const warning = {
                id: Date.now().toString(),
                reason: reason,
                moderator: interaction.user.id,
                timestamp: new Date().toISOString()
            };

            userData.warnings.push(warning);
            userData.infractions++;

            // Save to database
            db.saveUser(interaction.guild.id, targetUser.id, userData);

            const warnEmbed = new EmbedBuilder()
                .setColor('#ffff00')
                .setTitle('⚠️ User Warned')
                .setDescription(`**${targetUser.tag}** has been warned.`)
                .addFields(
                    { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                    { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                    { name: '📝 Reason', value: reason, inline: false },
                    { name: '📊 Total Warnings', value: `${userData.warnings.length}`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [warnEmbed] });

            // Try to DM the user
            try {
                await targetUser.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ffff00')
                            .setTitle('⚠️ You have been warned')
                            .setDescription(`You have been warned in **${interaction.guild.name}**`)
                            .addFields(
                                { name: '📝 Reason', value: reason },
                                { name: '📊 Total Warnings', value: `${userData.warnings.length}` }
                            )
                            .setTimestamp()
                    ]
                });
            } catch {
                // User has DMs disabled, ignore
            }

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to warn user!',
                ephemeral: true
            });
        }
    }
};