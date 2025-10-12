const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database/db');
const { EMOJIS, COLORS } = require('../../utils/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlink')
        .setDescription('🔓 Unlink your Roblox account from Discord'),
    
    async execute(interaction) {
        try {
            // Get user data
            const userData = db.getUser(interaction.guild.id, interaction.user.id) || {};

            // Check if user has a linked account
            if (!userData.robloxLinked) {
                const notLinkedEmbed = new EmbedBuilder()
                    .setColor(COLORS.WARNING)
                    .setTitle(`${EMOJIS.WARNING} No Linked Account`)
                    .setDescription('You don\'t have a Roblox account linked to your Discord.')
                    .addFields({
                        name: '🎮 Want to link an account?',
                        value: 'Use `/verify <username>` to link your Roblox account',
                        inline: false
                    })
                    .setFooter({ text: 'Game Killer\'s Security™' })
                    .setTimestamp();

                return interaction.reply({
                    embeds: [notLinkedEmbed],
                    ephemeral: true
                });
            }

            // Create confirmation embed
            const confirmEmbed = new EmbedBuilder()
                .setColor(COLORS.WARNING)
                .setTitle(`${EMOJIS.WARNING} Confirm Unlink`)
                .setDescription('Are you sure you want to unlink your Roblox account?')
                .addFields(
                    {
                        name: '🎮 Current Linked Account',
                        value: userData.robloxUsername || 'Unknown',
                        inline: true
                    },
                    {
                        name: '📅 Linked Since',
                        value: userData.robloxLinkedDate ? `<t:${Math.floor(new Date(userData.robloxLinkedDate).getTime() / 1000)}:R>` : 'Unknown',
                        inline: true
                    },
                    {
                        name: '⚠️ Warning',
                        value: '• You will lose access to Roblox-linked features\n' +
                               '• Ban sync will be disabled\n' +
                               '• You can re-link anytime with `/verify`',
                        inline: false
                    }
                )
                .setFooter({ text: 'This action can be reversed by verifying again' })
                .setTimestamp();

            const confirmButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`unlink_confirm_${interaction.user.id}`)
                        .setLabel('Yes, Unlink')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('✅'),
                    new ButtonBuilder()
                        .setCustomId(`unlink_cancel_${interaction.user.id}`)
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('❌')
                );

            await interaction.reply({
                embeds: [confirmEmbed],
                components: [confirmButtons],
                ephemeral: true
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to process unlink request!',
                ephemeral: true
            });
        }
    }
};