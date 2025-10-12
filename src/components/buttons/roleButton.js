const { EmbedBuilder } = require('discord.js');
const { EMOJIS, COLORS } = require('../../utils/constants');

module.exports = {
    name: 'roleButton',
    
    async execute(interaction) {
        // Parse button ID format: role_<roleId>_<action>
        const parts = interaction.customId.split('_');
        
        if (parts.length < 3) {
            return interaction.reply({
                content: '❌ Invalid button configuration!',
                ephemeral: true
            });
        }

        const roleId = parts[1];
        const action = parts[2]; // 'add' or 'remove'

        try {
            const role = interaction.guild.roles.cache.get(roleId);

            if (!role) {
                return interaction.reply({
                    content: '❌ Role not found! It may have been deleted.',
                    ephemeral: true
                });
            }

            const member = interaction.member;

            // Check if member already has the role
            const hasRole = member.roles.cache.has(roleId);

            if (action === 'add') {
                if (hasRole) {
                    return interaction.reply({
                        content: `⚠️ You already have the **${role.name}** role!`,
                        ephemeral: true
                    });
                }

                // Add role
                await member.roles.add(role);

                const addEmbed = new EmbedBuilder()
                    .setColor(COLORS.SUCCESS)
                    .setTitle(`${EMOJIS.SUCCESS} Role Added`)
                    .setDescription(`You have been given the **${role.name}** role!`)
                    .setFooter({ text: 'Click again to remove the role' })
                    .setTimestamp();

                return interaction.reply({
                    embeds: [addEmbed],
                    ephemeral: true
                });

            } else if (action === 'remove') {
                if (!hasRole) {
                    return interaction.reply({
                        content: `⚠️ You don't have the **${role.name}** role!`,
                        ephemeral: true
                    });
                }

                // Remove role
                await member.roles.remove(role);

                const removeEmbed = new EmbedBuilder()
                    .setColor(COLORS.WARNING)
                    .setTitle(`${EMOJIS.WARNING} Role Removed`)
                    .setDescription(`The **${role.name}** role has been removed from you.`)
                    .setFooter({ text: 'Click again to add the role back' })
                    .setTimestamp();

                return interaction.reply({
                    embeds: [removeEmbed],
                    ephemeral: true
                });

            } else if (action === 'toggle') {
                // Toggle role (add if don't have, remove if have)
                if (hasRole) {
                    await member.roles.remove(role);

                    const toggleRemoveEmbed = new EmbedBuilder()
                        .setColor(COLORS.WARNING)
                        .setTitle(`${EMOJIS.WARNING} Role Removed`)
                        .setDescription(`The **${role.name}** role has been removed from you.`)
                        .setTimestamp();

                    return interaction.reply({
                        embeds: [toggleRemoveEmbed],
                        ephemeral: true
                    });
                } else {
                    await member.roles.add(role);

                    const toggleAddEmbed = new EmbedBuilder()
                        .setColor(COLORS.SUCCESS)
                        .setTitle(`${EMOJIS.SUCCESS} Role Added`)
                        .setDescription(`You have been given the **${role.name}** role!`)
                        .setTimestamp();

                    return interaction.reply({
                        embeds: [toggleAddEmbed],
                        ephemeral: true
                    });
                }
            }

        } catch (error) {
            console.error('Error handling role button:', error);

            // Check if it's a permission error
            if (error.code === 50013) {
                return interaction.reply({
                    content: '❌ I don\'t have permission to manage this role! Make sure my role is higher than the role you\'re trying to assign.',
                    ephemeral: true
                });
            }

            return interaction.reply({
                content: '❌ Failed to update your roles! Please contact a server administrator.',
                ephemeral: true
            });
        }
    }
};