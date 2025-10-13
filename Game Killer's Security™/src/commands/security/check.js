const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check')
        .setDescription('🔍 Check a user\'s warnings, infractions, and security flags')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to check')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(targetUser.id);

        if (!member) {
            return interaction.reply({
                content: '❌ User not found in this server!',
                ephemeral: true
            });
        }

        try {
            // Get user data from database
            const userData = db.getUser(interaction.guild.id, targetUser.id);

            if (!userData || (!userData.warnings?.length && !userData.infractions)) {
                const cleanEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Clean Record')
                    .setDescription(`**${targetUser.tag}** has a clean record!`)
                    .addFields(
                        { name: '👤 User', value: `${targetUser.tag}`, inline: true },
                        { name: '🆔 User ID', value: targetUser.id, inline: true },
                        { name: '📊 Total Infractions', value: '0', inline: true },
                        { name: '⚠️ Active Warnings', value: '0', inline: true },
                        { name: '🛡️ Account Status', value: '✅ Good Standing', inline: false }
                    )
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                return interaction.reply({ embeds: [cleanEmbed], ephemeral: true });
            }

            // Calculate risk level
            const infractions = userData.infractions || 0;
            const warnings = userData.warnings?.length || 0;
            
            let riskLevel = '🟢 Low Risk';
            let riskColor = '#00ff00';
            
            if (infractions >= 5 || warnings >= 3) {
                riskLevel = '🔴 High Risk';
                riskColor = '#ff0000';
            } else if (infractions >= 3 || warnings >= 2) {
                riskLevel = '🟡 Medium Risk';
                riskColor = '#ffff00';
            }

            // Build embed
            const checkEmbed = new EmbedBuilder()
                .setColor(riskColor)
                .setTitle('🔍 User Security Check')
                .setDescription(`Security information for **${targetUser.tag}**`)
                .addFields(
                    { name: '👤 User', value: `${targetUser.tag}`, inline: true },
                    { name: '🆔 User ID', value: targetUser.id, inline: true },
                    { name: '⚠️ Risk Level', value: riskLevel, inline: true },
                    { name: '📊 Total Infractions', value: `${infractions}`, inline: true },
                    { name: '⚠️ Active Warnings', value: `${warnings}`, inline: true },
                    { name: '📅 Account Created', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true }
                )
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            // Add recent warnings if any
            if (userData.warnings && userData.warnings.length > 0) {
                const recentWarnings = userData.warnings
                    .slice(-3)
                    .reverse()
                    .map((w, i) => {
                        const mod = interaction.guild.members.cache.get(w.moderator);
                        const modName = mod ? mod.user.tag : 'Unknown';
                        const timestamp = new Date(w.timestamp);
                        return `**${i + 1}.** ${w.reason}\n*By ${modName} • <t:${Math.floor(timestamp.getTime() / 1000)}:R>*`;
                    })
                    .join('\n\n');

                checkEmbed.addFields({
                    name: '📋 Recent Warnings',
                    value: recentWarnings,
                    inline: false
                });
            }

            // Add flags if any
            if (userData.flags && userData.flags.length > 0) {
                checkEmbed.addFields({
                    name: '🚩 Security Flags',
                    value: userData.flags.join(', '),
                    inline: false
                });
            }

            await interaction.reply({ embeds: [checkEmbed], ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to check user information!',
                ephemeral: true
            });
        }
    }
};