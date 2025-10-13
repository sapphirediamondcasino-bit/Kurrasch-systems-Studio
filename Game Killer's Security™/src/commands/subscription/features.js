const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { TIERS, EMOJIS, COLORS } = require('../../utils/constants');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('features')
        .setDescription('📋 View all subscription tier features and compare plans')
        .addStringOption(option =>
            option
                .setName('tier')
                .setDescription('View specific tier features')
                .setRequired(false)
                .addChoices(
                    { name: 'Free Tier', value: 'free' },
                    { name: 'Basic Tier', value: 'basic' },
                    { name: 'Pro Tier', value: 'pro' },
                    { name: 'Enterprise Tier', value: 'enterprise' }
                )),
    
    async execute(interaction) {
        const selectedTier = interaction.options.getString('tier');

        try {
            if (selectedTier) {
                // Show specific tier details
                const tierData = TIERS[selectedTier.toUpperCase()];
                
                if (!tierData) {
                    return interaction.reply({
                        content: '❌ Invalid tier selected!',
                        ephemeral: true
                    });
                }

                const tierColors = {
                    free: COLORS.NEUTRAL,
                    basic: COLORS.INFO,
                    pro: COLORS.PRO,
                    enterprise: COLORS.ENTERPRISE
                };

                const tierEmbed = new EmbedBuilder()
                    .setColor(tierColors[selectedTier])
                    .setTitle(`${EMOJIS.DIAMOND} ${tierData.name} Tier Features`)
                    .setDescription(`Complete feature list for the **${tierData.name}** subscription tier`)
                    .addFields(
                        {
                            name: '💰 Price',
                            value: tierData.price,
                            inline: true
                        },
                        {
                            name: '✨ Features Included',
                            value: tierData.features.map(f => `• ${f}`).join('\n'),
                            inline: false
                        }
                    )
                    .setFooter({ text: 'Use /subscribe to upgrade your server' })
                    .setTimestamp();

                // Add limits info
                if (tierData.limits) {
                    const limitsText = Object.entries(tierData.limits)
                        .map(([key, value]) => {
                            const name = key.replace('max', '').replace(/([A-Z])/g, ' $1').trim();
                            return `• ${name}: ${value === -1 ? 'Unlimited' : value}`;
                        })
                        .join('\n');

                    tierEmbed.addFields({
                        name: '📊 Limits',
                        value: limitsText,
                        inline: false
                    });
                }

                const upgradeButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`upgrade_${selectedTier}`)
                            .setLabel(`Upgrade to ${tierData.name}`)
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('⬆️')
                    );

                await interaction.reply({
                    embeds: [tierEmbed],
                    components: [upgradeButton]
                });

            } else {
                // Show comparison of all tiers
                const serverData = db.getServer(interaction.guild.id) || {};
                const currentTier = serverData.tier || 'Free';

                const comparisonEmbed = new EmbedBuilder()
                    .setColor(COLORS.INFO)
                    .setTitle(`${EMOJIS.STAR} Subscription Tier Comparison`)
                    .setDescription(`Compare all available tiers for **${interaction.guild.name}**\n\n**Current Tier:** ${currentTier}`)
                    .addFields(
                        {
                            name: '📦 Free Tier',
                            value: `**Price:** ${TIERS.FREE.price}\n` +
                                   `**Features:** ${TIERS.FREE.features.length}\n` +
                                   `• ${TIERS.FREE.features.slice(0, 3).join('\n• ')}`,
                            inline: true
                        },
                        {
                            name: '⭐ Basic Tier',
                            value: `**Price:** ${TIERS.BASIC.price}\n` +
                                   `**Features:** ${TIERS.BASIC.features.length}\n` +
                                   `• ${TIERS.BASIC.features.slice(0, 3).join('\n• ')}`,
                            inline: true
                        },
                        {
                            name: '💎 Pro Tier',
                            value: `**Price:** ${TIERS.PRO.price}\n` +
                                   `**Features:** ${TIERS.PRO.features.length}\n` +
                                   `• ${TIERS.PRO.features.slice(0, 3).join('\n• ')}`,
                            inline: true
                        },
                        {
                            name: '👑 Enterprise Tier',
                            value: `**Price:** ${TIERS.ENTERPRISE.price}\n` +
                                   `**Features:** ${TIERS.ENTERPRISE.features.length}\n` +
                                   `• ${TIERS.ENTERPRISE.features.slice(0, 3).join('\n• ')}`,
                            inline: true
                        }
                    )
                    .setFooter({ text: 'Use /features <tier> to see full details for a specific tier' })
                    .setTimestamp();

                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('features_free')
                            .setLabel('Free Details')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('📦'),
                        new ButtonBuilder()
                            .setCustomId('features_basic')
                            .setLabel('Basic Details')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('⭐'),
                        new ButtonBuilder()
                            .setCustomId('features_pro')
                            .setLabel('Pro Details')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('💎'),
                        new ButtonBuilder()
                            .setCustomId('features_enterprise')
                            .setLabel('Enterprise Details')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('👑')
                    );

                await interaction.reply({
                    embeds: [comparisonEmbed],
                    components: [buttons]
                });
            }

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to load features information!',
                ephemeral: true
            });
        }
    }
};