const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database/db');
const { TIERS, EMOJIS, COLORS } = require('../../utils/constants');

module.exports = {
    name: 'subscriptionTier',
    
    async execute(interaction) {
        const buttonId = interaction.customId;

        // Handle tier selection buttons
        if (buttonId.startsWith('tier_')) {
            await handleTierSelection(interaction);
        }
        
        // Handle subscription management buttons
        else if (buttonId === 'subscription_manage') {
            await handleManageSubscription(interaction);
        }
        else if (buttonId === 'subscription_features') {
            await handleFeatureComparison(interaction);
        }
        else if (buttonId === 'subscription_cancel') {
            await handleCancelSubscription(interaction);
        }
        
        // Handle upgrade buttons
        else if (buttonId.startsWith('upgrade_')) {
            await handleUpgrade(interaction);
        }
        
        // Handle Pro subscription button
        else if (buttonId === 'subscribe_pro') {
            await handleSubscribePro(interaction);
        }
    }
};

/**
 * Handle tier selection
 */
async function handleTierSelection(interaction) {
    const tierKey = interaction.customId.replace('tier_', '').toUpperCase();
    const tierData = TIERS[tierKey];

    if (!tierData) {
        return interaction.reply({
            content: '❌ Invalid tier selected!',
            ephemeral: true
        });
    }

    const tierColors = {
        FREE: COLORS.NEUTRAL,
        BASIC: COLORS.INFO,
        PRO: COLORS.PRO,
        ENTERPRISE: COLORS.ENTERPRISE
    };

    const tierEmbed = new EmbedBuilder()
        .setColor(tierColors[tierKey])
        .setTitle(`${EMOJIS.DIAMOND} ${tierData.name} Tier`)
        .setDescription(`Detailed information about the **${tierData.name}** subscription tier.`)
        .addFields(
            {
                name: '💰 Pricing',
                value: tierData.price,
                inline: true
            },
            {
                name: '✨ Features',
                value: tierData.features.map(f => `• ${f}`).join('\n'),
                inline: false
            }
        )
        .setFooter({ text: 'Game Killer\'s Security™ | Subscription Plans' })
        .setTimestamp();

    // Add limits information
    if (tierData.limits) {
        const limitsText = Object.entries(tierData.limits)
            .map(([key, value]) => {
                const name = key.replace('max', '').replace(/([A-Z])/g, ' $1').trim();
                const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
                return `• ${capitalizedName}: ${value === -1 ? 'Unlimited' : value}`;
            })
            .join('\n');

        tierEmbed.addFields({
            name: '📊 Limits',
            value: limitsText,
            inline: false
        });
    }

    // Add upgrade button if not on free tier
    const buttons = new ActionRowBuilder();
    
    if (tierKey !== 'FREE') {
        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId(`upgrade_${tierKey.toLowerCase()}`)
                .setLabel(`Upgrade to ${tierData.name}`)
                .setStyle(ButtonStyle.Success)
                .setEmoji('⬆️')
        );

        await interaction.reply({
            embeds: [tierEmbed],
            components: [buttons],
            ephemeral: true
        });
    } else {
        await interaction.reply({
            embeds: [tierEmbed],
            ephemeral: true
        });
    }
}

/**
 * Handle subscription management
 */
async function handleManageSubscription(interaction) {
    const serverData = db.getServer(interaction.guild.id) || {};
    const currentTier = serverData.tier || 'Free';

    const manageEmbed = new EmbedBuilder()
        .setColor(COLORS.INFO)
        .setTitle(`${EMOJIS.SETTINGS} Subscription Management`)
        .setDescription(`Manage your subscription for **${interaction.guild.name}**`)
        .addFields(
            {
                name: '💎 Current Tier',
                value: currentTier,
                inline: true
            },
            {
                name: '📅 Subscription Status',
                value: currentTier === 'Free' ? 'No active subscription' : '✅ Active',
                inline: true
            },
            {
                name: '🔄 Actions Available',
                value: currentTier === 'Free' 
                    ? '• Upgrade to a paid tier\n• View feature comparison'
                    : '• Change tier\n• View invoice history\n• Cancel subscription',
                inline: false
            }
        )
        .setFooter({ text: 'Contact support for billing questions' })
        .setTimestamp();

    await interaction.reply({
        embeds: [manageEmbed],
        ephemeral: true
    });
}

/**
 * Handle feature comparison
 */
async function handleFeatureComparison(interaction) {
    const comparisonEmbed = new EmbedBuilder()
        .setColor(COLORS.INFO)
        .setTitle(`${EMOJIS.STAR} Tier Feature Comparison`)
        .setDescription('Compare features across all subscription tiers')
        .addFields(
            {
                name: '📦 Free Tier',
                value: `**${TIERS.FREE.price}**\n` +
                       `${TIERS.FREE.features.slice(0, 3).map(f => `• ${f}`).join('\n')}`,
                inline: true
            },
            {
                name: '⭐ Basic Tier',
                value: `**${TIERS.BASIC.price}**\n` +
                       `${TIERS.BASIC.features.slice(0, 3).map(f => `• ${f}`).join('\n')}`,
                inline: true
            },
            {
                name: '💎 Pro Tier',
                value: `**${TIERS.PRO.price}**\n` +
                       `${TIERS.PRO.features.slice(0, 3).map(f => `• ${f}`).join('\n')}`,
                inline: true
            },
            {
                name: '👑 Enterprise Tier',
                value: `**${TIERS.ENTERPRISE.price}**\n` +
                       `${TIERS.ENTERPRISE.features.slice(0, 3).map(f => `• ${f}`).join('\n')}`,
                inline: true
            }
        )
        .setFooter({ text: 'Use /features <tier> to see full details' })
        .setTimestamp();

    await interaction.reply({
        embeds: [comparisonEmbed],
        ephemeral: true
    });
}

/**
 * Handle subscription cancellation
 */
async function handleCancelSubscription(interaction) {
    const serverData = db.getServer(interaction.guild.id) || {};
    const currentTier = serverData.tier || 'Free';

    if (currentTier === 'Free') {
        return interaction.reply({
            content: '⚠️ You don\'t have an active subscription to cancel!',
            ephemeral: true
        });
    }

    const cancelEmbed = new EmbedBuilder()
        .setColor(COLORS.WARNING)
        .setTitle(`${EMOJIS.WARNING} Cancel Subscription`)
        .setDescription('Are you sure you want to cancel your subscription?')
        .addFields(
            {
                name: '💎 Current Tier',
                value: currentTier,
                inline: true
            },
            {
                name: '⚠️ What happens when you cancel',
                value: '• You will lose access to premium features\n' +
                       '• Your data will be preserved\n' +
                       '• You can re-subscribe anytime\n' +
                       '• No refunds for current billing period',
                inline: false
            },
            {
                name: '📞 Need Help?',
                value: 'Contact our support team if you\'re having issues or have questions.',
                inline: false
            }
        )
        .setFooter({ text: 'Subscription cancellations are processed at the end of the billing period' })
        .setTimestamp();

    const confirmButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('cancel_confirm')
                .setLabel('Yes, Cancel Subscription')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌'),
            new ButtonBuilder()
                .setCustomId('cancel_keep')
                .setLabel('Keep Subscription')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅')
        );

    await interaction.reply({
        embeds: [cancelEmbed],
        components: [confirmButtons],
        ephemeral: true
    });
}

/**
 * Handle tier upgrade
 */
async function handleUpgrade(interaction) {
    const tierKey = interaction.customId.replace('upgrade_', '').toUpperCase();
    const tierData = TIERS[tierKey];

    if (!tierData) {
        return interaction.reply({
            content: '❌ Invalid tier selected!',
            ephemeral: true
        });
    }

    const upgradeEmbed = new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle(`${EMOJIS.ARROW_UP} Upgrade to ${tierData.name}`)
        .setDescription(`You're about to upgrade to the **${tierData.name}** tier!`)
        .addFields(
            {
                name: '💰 Price',
                value: tierData.price,
                inline: true
            },
            {
                name: '🎁 Trial',
                value: tierKey === 'PRO' ? '7-day free trial available' : 'Contact us for demo',
                inline: true
            },
            {
                name: '✨ What you get',
                value: tierData.features.slice(0, 5).map(f => `• ${f}`).join('\n'),
                inline: false
            },
            {
                name: '📝 Next Steps',
                value: '1. Click "Proceed to Payment" below\n' +
                       '2. PayPal payment link will be sent\n' +
                       '3. Complete payment securely via PayPal\n' +
                       '4. Instant activation after payment confirmed',
                inline: false
            }
        )
        .setFooter({ text: 'Secure payment powered by PayPal' })
        .setTimestamp();

    const paymentButton = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`payment_${tierKey.toLowerCase()}`)
                .setLabel('Proceed to Payment')
                .setStyle(ButtonStyle.Success)
                .setEmoji('💳')
        );

    await interaction.reply({
        embeds: [upgradeEmbed],
        components: [paymentButton],
        ephemeral: true
    });

    console.log(`💎 ${interaction.user.tag} initiated upgrade to ${tierData.name} in ${interaction.guild.name}`);
}

/**
 * Handle Pro subscription from upgrade button
 */
async function handleSubscribePro(interaction) {
    const upgradeEmbed = new EmbedBuilder()
        .setColor(COLORS.PRO)
        .setTitle(`${EMOJIS.DIAMOND} Upgrade to Pro`)
        .setDescription('Unlock the full power of Game Killer\'s Security™!')
        .addFields(
            {
                name: '✨ Pro Features',
                value: TIERS.PRO.features.map(f => `• ${f}`).join('\n'),
                inline: false
            },
            {
                name: '💰 Pricing',
                value: TIERS.PRO.price,
                inline: true
            },
            {
                name: '🎁 Free Trial',
                value: '7 days free',
                inline: true
            }
        )
        .setFooter({ text: 'Start your free trial today!' })
        .setTimestamp();

    const upgradeButton = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('trial_start_pro')
                .setLabel('Start Free Trial')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🚀')
        );

    await interaction.reply({
        embeds: [upgradeEmbed],
        components: [upgradeButton],
        ephemeral: true
    });
}