const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database/db');

module.exports = {
    name: 'settingsMenu',
    
    async execute(interaction) {
        if (interaction.customId !== 'settings_category') return;

        const category = interaction.values[0];
        const serverData = db.getServer(interaction.guild.id) || {};

        // Initialize settings if not exist
        if (!serverData.settings) {
            serverData.settings = {
                autoMod: false,
                securityLevel: 'Medium',
                logChannel: null,
                reportChannel: null,
                welcomeChannel: null,
                antiSpam: true,
                antiRaid: false,
                linkFilter: false,
                wordFilter: false,
                maxWarnings: 3,
                autoTimeout: false,
                timeoutDuration: 60
            };
        }

        await interaction.deferUpdate();

        // Show settings for selected category
        switch(category) {
            case 'security':
                await showSecuritySettings(interaction, serverData);
                break;
            case 'filters':
                await showFilterSettings(interaction, serverData);
                break;
            case 'channels':
                await showChannelSettings(interaction, serverData);
                break;
            case 'moderation':
                await showModerationSettings(interaction, serverData);
                break;
            case 'advanced':
                await showAdvancedSettings(interaction, serverData);
                break;
        }
    }
};

/**
 * Show security settings
 */
async function showSecuritySettings(interaction, serverData) {
    const embed = new EmbedBuilder()
        .setColor('#ff6600')
        .setTitle('🛡️ Security Settings')
        .setDescription('Configure core security features for your server.')
        .addFields(
            {
                name: '🤖 Auto-Moderation',
                value: `**Status:** ${serverData.settings.autoMod ? '✅ Enabled' : '❌ Disabled'}\n` +
                       `Automatically moderate messages based on security rules.`,
                inline: false
            },
            {
                name: '⚡ Security Level',
                value: `**Current:** ${serverData.settings.securityLevel}\n` +
                       `Options: Low, Medium, High, Maximum`,
                inline: false
            },
            {
                name: '🚫 Anti-Spam',
                value: `**Status:** ${serverData.settings.antiSpam ? '✅ Enabled' : '❌ Disabled'}\n` +
                       `Automatically detect and remove spam messages.`,
                inline: false
            },
            {
                name: '🛡️ Anti-Raid',
                value: `**Status:** ${serverData.settings.antiRaid ? '✅ Enabled' : '❌ Disabled'}\n` +
                       `Protect against mass join/spam raids.`,
                inline: false
            }
        )
        .setFooter({ text: 'Click buttons below to toggle settings' })
        .setTimestamp();

    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('toggle_automod')
                .setLabel(`Auto-Mod: ${serverData.settings.autoMod ? 'ON' : 'OFF'}`)
                .setStyle(serverData.settings.autoMod ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji('🤖'),
            new ButtonBuilder()
                .setCustomId('toggle_antispam')
                .setLabel(`Anti-Spam: ${serverData.settings.antiSpam ? 'ON' : 'OFF'}`)
                .setStyle(serverData.settings.antiSpam ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji('🚫'),
            new ButtonBuilder()
                .setCustomId('toggle_antiraid')
                .setLabel(`Anti-Raid: ${serverData.settings.antiRaid ? 'ON' : 'OFF'}`)
                .setStyle(serverData.settings.antiRaid ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji('🛡️')
        );

    await interaction.editReply({ embeds: [embed], components: [buttons] });
}

/**
 * Show filter settings
 */
async function showFilterSettings(interaction, serverData) {
    const embed = new EmbedBuilder()
        .setColor('#00d9ff')
        .setTitle('🔍 Filter Settings')
        .setDescription('Configure content filtering and moderation.')
        .addFields(
            {
                name: '🔗 Link Filter',
                value: `**Status:** ${serverData.settings.linkFilter ? '✅ Enabled' : '❌ Disabled'}\n` +
                       `Block unauthorized links and URLs.`,
                inline: false
            },
            {
                name: '💬 Word Filter',
                value: `**Status:** ${serverData.settings.wordFilter ? '✅ Enabled' : '❌ Disabled'}\n` +
                       `Filter inappropriate language and words.`,
                inline: false
            },
            {
                name: '⏰ Auto-Timeout',
                value: `**Status:** ${serverData.settings.autoTimeout ? '✅ Enabled' : '❌ Disabled'}\n` +
                       `Automatically timeout users after violations.`,
                inline: false
            }
        )
        .setFooter({ text: 'Filters help maintain a safe environment' })
        .setTimestamp();

    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('toggle_linkfilter')
                .setLabel(`Link Filter: ${serverData.settings.linkFilter ? 'ON' : 'OFF'}`)
                .setStyle(serverData.settings.linkFilter ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji('🔗'),
            new ButtonBuilder()
                .setCustomId('toggle_wordfilter')
                .setLabel(`Word Filter: ${serverData.settings.wordFilter ? 'ON' : 'OFF'}`)
                .setStyle(serverData.settings.wordFilter ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji('💬'),
            new ButtonBuilder()
                .setCustomId('toggle_autotimeout')
                .setLabel(`Auto-Timeout: ${serverData.settings.autoTimeout ? 'ON' : 'OFF'}`)
                .setStyle(serverData.settings.autoTimeout ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji('⏰')
        );

    await interaction.editReply({ embeds: [embed], components: [buttons] });
}

/**
 * Show channel settings
 */
async function showChannelSettings(interaction, serverData) {
    const embed = new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle('📊 Channel Settings')
        .setDescription('Configure channels for logs, reports, and notifications.')
        .addFields(
            {
                name: '📋 Log Channel',
                value: serverData.settings.logChannel 
                    ? `Current: <#${serverData.settings.logChannel}>`
                    : 'Not configured',
                inline: false
            },
            {
                name: '🚨 Report Channel',
                value: serverData.settings.reportChannel 
                    ? `Current: <#${serverData.settings.reportChannel}>`
                    : 'Not configured',
                inline: false
            },
            {
                name: '👋 Welcome Channel',
                value: serverData.settings.welcomeChannel 
                    ? `Current: <#${serverData.settings.welcomeChannel}>`
                    : 'Not configured',
                inline: false
            }
        )
        .setFooter({ text: 'Use dropdown menus to select channels' })
        .setTimestamp();

    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('set_logchannel')
                .setLabel('Set Log Channel')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📋'),
            new ButtonBuilder()
                .setCustomId('set_reportchannel')
                .setLabel('Set Report Channel')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🚨'),
            new ButtonBuilder()
                .setCustomId('set_welcomechannel')
                .setLabel('Set Welcome Channel')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('👋')
        );

    await interaction.editReply({ embeds: [embed], components: [buttons] });
}

/**
 * Show moderation settings
 */
async function showModerationSettings(interaction, serverData) {
    const embed = new EmbedBuilder()
        .setColor('#ffff00')
        .setTitle('⚠️ Moderation Settings')
        .setDescription('Configure automatic moderation actions and thresholds.')
        .addFields(
            {
                name: '⚠️ Maximum Warnings',
                value: `**Current:** ${serverData.settings.maxWarnings}\n` +
                       `Users are auto-actioned after reaching this limit.`,
                inline: false
            },
            {
                name: '⏱️ Auto-Timeout Duration',
                value: `**Current:** ${serverData.settings.timeoutDuration} minutes\n` +
                       `Default timeout length for auto-moderation.`,
                inline: false
            },
            {
                name: '🔨 Auto-Actions',
                value: `Configure what happens when limits are reached:\n` +
                       `• Timeout\n• Kick\n• Ban (Pro only)`,
                inline: false
            }
        )
        .setFooter({ text: 'Set appropriate thresholds for your community' })
        .setTimestamp();

    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('adjust_maxwarnings')
                .setLabel(`Max Warnings: ${serverData.settings.maxWarnings}`)
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⚠️'),
            new ButtonBuilder()
                .setCustomId('adjust_timeout')
                .setLabel(`Timeout: ${serverData.settings.timeoutDuration}m`)
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⏱️')
        );

    await interaction.editReply({ embeds: [embed], components: [buttons] });
}

/**
 * Show advanced settings
 */
async function showAdvancedSettings(interaction, serverData) {
    const tier = serverData.tier || 'Free';
    const isPro = tier === 'Pro' || tier === 'Enterprise';

    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔧 Advanced Settings')
        .setDescription(
            isPro 
                ? 'Advanced features for Pro subscribers.'
                : '💎 **Pro Feature Required**\n\nUpgrade to unlock advanced settings!'
        )
        .addFields(
            {
                name: '🤖 AI Threat Detection',
                value: isPro 
                    ? '✅ Available - Configure AI behavior analysis'
                    : '🔒 Locked - Upgrade to Pro',
                inline: false
            },
            {
                name: '🎮 Roblox Integration',
                value: isPro 
                    ? '✅ Available - Sync bans across platforms'
                    : '🔒 Locked - Upgrade to Pro',
                inline: false
            },
            {
                name: '📊 Custom Rules',
                value: isPro 
                    ? '✅ Available - Create custom moderation rules'
                    : '🔒 Locked - Upgrade to Pro',
                inline: false
            }
        )
        .setFooter({ text: isPro ? 'Pro features enabled' : 'Use /subscribe to upgrade' })
        .setTimestamp();

    const buttons = new ActionRowBuilder();
    
    if (isPro) {
        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId('configure_ai')
                .setLabel('Configure AI')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🤖'),
            new ButtonBuilder()
                .setCustomId('configure_roblox')
                .setLabel('Roblox Sync')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎮')
        );
    } else {
        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId('upgrade_pro')
                .setLabel('Upgrade to Pro')
                .setStyle(ButtonStyle.Success)
                .setEmoji('💎')
        );
    }

    await interaction.editReply({ embeds: [embed], components: [buttons] });
}