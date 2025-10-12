const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');
const { TIERS, EMOJIS, COLORS } = require('../../utils/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('subscribe')
        .setDescription('💎 View and manage your server subscription')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        try {
            const serverData = db.getServer(interaction.guild.id) || {};
            const currentTier = serverData.tier || 'Free';

            // Create main subscription embed
            const subscribeEmbed = new EmbedBuilder()
                .setColor(COLORS.INFO)
                .setTitle(`${EMOJIS.DIAMOND} Game Killer's Security™ - Subscription Management`)
                .setDescription(`Current subscription for **${interaction.guild.name}**`)
                .addFields(
                    {
                        name: `${EMOJIS.STAR} Current Tier`,
                        value: `**${currentTier}**`,
                        inline: true
                    },
                    {
                        name: `${EMOJIS.INFO} Status`,
                        value: currentTier === 'Free' ? '⬆️ Upgrade Available' : '✅ Active',
                        inline: true
                    },
                    {
                        name: `${EMOJIS.SETTINGS} Manage`,
                        value: 'Use buttons below to view tiers',
                        inline: true
                    }
                )
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({ text: 'Select a tier below to view details' })
                .setTimestamp();

            // Add current tier features
            const tierInfo = TIERS[currentTier.toUpperCase()] || TIERS.FREE;
            subscribeEmbed.addFields({
                name: `${EMOJIS.CHECK} Your Current Features`,
                value: tierInfo.features.slice(0, 5).map(f => `• ${f}`).join('\n'),
                inline: false
            });

            // Create tier selection buttons
            const tierButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('tier_free')
                        .setLabel('Free')
                        .setStyle(currentTier === 'Free' ? ButtonStyle.Success : ButtonStyle.Secondary)
                        .setEmoji('📦'),
                    new ButtonBuilder()
                        .setCustomId('tier_basic')
                        .setLabel('Basic - $4.99')
                        .setStyle(currentTier === 'Basic' ? ButtonStyle.Success : ButtonStyle.Primary)
                        .setEmoji('⭐'),
                    new ButtonBuilder()
                        .setCustomId('tier_pro')
                        .setLabel('Pro - $9.99')
                        .setStyle(currentTier === 'Pro' ? ButtonStyle.Success : ButtonStyle.Primary)
                        .setEmoji('💎'),
                    new ButtonBuilder()
                        .setCustomId('tier_enterprise')
                        .setLabel('Enterprise')
                        .setStyle(currentTier === 'Enterprise' ? ButtonStyle.Success : ButtonStyle.Primary)
                        .setEmoji('👑')
                );

            // Create action buttons
            const actionButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('subscription_manage')
                        .setLabel('Manage Subscription')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('⚙️'),
                    new ButtonBuilder()
                        .setCustomId('subscription_features')
                        .setLabel('Compare Features')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('📋'),
                    new ButtonBuilder()
                        .setCustomId('subscription_cancel')
                        .setLabel('Cancel Subscription')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('❌')
                        .setDisabled(currentTier === 'Free')
                );

            await interaction.reply({
                embeds: [subscribeEmbed],
                components: [tierButtons, actionButtons]
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to load subscription information!',
                ephemeral: true
            });
        }
    }
};