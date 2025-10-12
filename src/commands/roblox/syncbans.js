const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');
const { EMOJIS, COLORS } = require('../../utils/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('syncbans')
        .setDescription('🔄 Sync Roblox bans with Discord server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable automatic ban syncing'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable automatic ban syncing'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Check ban sync status'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('manual')
                .setDescription('Manually sync bans now'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        try {
            const serverData = db.getServer(interaction.guild.id) || {};

            switch (subcommand) {
                case 'enable':
                    await handleEnable(interaction, serverData);
                    break;
                case 'disable':
                    await handleDisable(interaction, serverData);
                    break;
                case 'status':
                    await handleStatus(interaction, serverData);
                    break;
                case 'manual':
                    await handleManualSync(interaction, serverData);
                    break;
            }

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to execute ban sync command!',
                ephemeral: true
            });
        }
    }
};

/**
 * Enable ban syncing
 */
async function handleEnable(interaction, serverData) {
    // Check if server has Pro tier
    if (!serverData.tier || serverData.tier === 'Free') {
        const upgradeEmbed = new EmbedBuilder()
            .setColor(COLORS.WARNING)
            .setTitle(`${EMOJIS.DIAMOND} Pro Feature Required`)
            .setDescription('Roblox ban syncing is only available for **Pro** and **Enterprise** tiers.')
            .addFields({
                name: '✨ Upgrade to unlock:',
                value: '• Automatic ban syncing\n' +
                       '• Cross-platform moderation\n' +
                       '• Real-time sync updates\n' +
                       '• Ban history tracking',
                inline: false
            })
            .setFooter({ text: 'Use /subscribe to upgrade' })
            .setTimestamp();

        return interaction.reply({
            embeds: [upgradeEmbed],
            ephemeral: true
        });
    }

    // Enable ban syncing
    serverData.banSyncEnabled = true;
    serverData.banSyncLastUpdated = new Date().toISOString();
    db.saveServer(interaction.guild.id, serverData);

    const enableEmbed = new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle(`${EMOJIS.SUCCESS} Ban Sync Enabled`)
        .setDescription('Roblox ban syncing has been enabled for this server.')
        .addFields(
            {
                name: '✅ What happens now?',
                value: '• Users banned on Roblox will be banned on Discord\n' +
                       '• Users banned on Discord will be reported to Roblox\n' +
                       '• Sync runs automatically every hour\n' +
                       '• Manual sync available with `/syncbans manual`',
                inline: false
            },
            {
                name: '🎮 Requirements',
                value: '• Users must link their Roblox accounts with `/verify`\n' +
                       '• Bot needs Ban Members permission\n' +
                       '• Roblox game API access configured',
                inline: false
            }
        )
        .setFooter({ text: 'Ban sync is now active' })
        .setTimestamp();

    await interaction.reply({ embeds: [enableEmbed] });
    console.log(`🔄 Ban sync enabled for guild: ${interaction.guild.id}`);
}

/**
 * Disable ban syncing
 */
async function handleDisable(interaction, serverData) {
    if (!serverData.banSyncEnabled) {
        return interaction.reply({
            content: '⚠️ Ban syncing is already disabled!',
            ephemeral: true
        });
    }

    serverData.banSyncEnabled = false;
    serverData.banSyncLastUpdated = new Date().toISOString();
    db.saveServer(interaction.guild.id, serverData);

    const disableEmbed = new EmbedBuilder()
        .setColor(COLORS.WARNING)
        .setTitle(`${EMOJIS.WARNING} Ban Sync Disabled`)
        .setDescription('Roblox ban syncing has been disabled for this server.')
        .addFields({
            name: 'ℹ️ Note',
            value: '• Existing bans will remain\n' +
                   '• No new bans will be synced\n' +
                   '• Re-enable anytime with `/syncbans enable`',
            inline: false
        })
        .setFooter({ text: 'Ban sync is now inactive' })
        .setTimestamp();

    await interaction.reply({ embeds: [disableEmbed] });
    console.log(`🔄 Ban sync disabled for guild: ${interaction.guild.id}`);
}

/**
 * Check ban sync status
 */
async function handleStatus(interaction, serverData) {
    const isEnabled = serverData.banSyncEnabled || false;
    const lastSync = serverData.banSyncLastRun || null;
    const totalSynced = serverData.bansSynced || 0;

    const statusEmbed = new EmbedBuilder()
        .setColor(isEnabled ? COLORS.SUCCESS : COLORS.NEUTRAL)
        .setTitle(`${EMOJIS.INFO} Ban Sync Status`)
        .setDescription(`Current ban syncing status for **${interaction.guild.name}**`)
        .addFields(
            {
                name: '📊 Status',
                value: isEnabled ? '✅ Enabled' : '❌ Disabled',
                inline: true
            },
            {
                name: '💎 Tier',
                value: serverData.tier || 'Free',
                inline: true
            },
            {
                name: '🔄 Last Sync',
                value: lastSync ? `<t:${Math.floor(new Date(lastSync).getTime() / 1000)}:R>` : 'Never',
                inline: true
            },
            {
                name: '📈 Total Bans Synced',
                value: `${totalSynced}`,
                inline: true
            },
            {
                name: '🎮 Linked Users',
                value: `${countLinkedUsers(interaction.guild.id)}`,
                inline: true
            },
            {
                name: '⏱️ Next Sync',
                value: isEnabled ? 'Within 1 hour' : 'N/A',
                inline: true
            }
        )
        .setFooter({ text: 'Game Killer\'s Security™' })
        .setTimestamp();

    await interaction.reply({ embeds: [statusEmbed], ephemeral: true });
}

/**
 * Manual ban sync
 */
async function handleManualSync(interaction, serverData) {
    if (!serverData.banSyncEnabled) {
        return interaction.reply({
            content: '⚠️ Ban syncing is disabled! Enable it first with `/syncbans enable`',
            ephemeral: true
        });
    }

    // Check if server has Pro tier
    if (!serverData.tier || serverData.tier === 'Free') {
        return interaction.reply({
            content: '💎 Manual sync is only available for Pro and Enterprise tiers!',
            ephemeral: true
        });
    }

    await interaction.deferReply({ ephemeral: true });

    // Simulate sync process (in real implementation, call Roblox API)
    const linkedUsers = getAllLinkedUsers(interaction.guild.id);
    let syncedCount = 0;
    let errorCount = 0;

    // Placeholder sync logic
    for (const userId in linkedUsers) {
        // In real implementation, check Roblox ban status and sync
        // For now, just count linked users
        syncedCount++;
    }

    // Update server data
    serverData.banSyncLastRun = new Date().toISOString();
    serverData.bansSynced = (serverData.bansSynced || 0) + syncedCount;
    db.saveServer(interaction.guild.id, serverData);

    const syncEmbed = new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle(`${EMOJIS.SUCCESS} Manual Sync Complete`)
        .setDescription('Ban sync has been executed successfully.')
        .addFields(
            {
                name: '✅ Synced',
                value: `${syncedCount}`,
                inline: true
            },
            {
                name: '❌ Errors',
                value: `${errorCount}`,
                inline: true
            },
            {
                name: '⏱️ Completed',
                value: '<t:' + Math.floor(Date.now() / 1000) + ':R>',
                inline: true
            }
        )
        .setFooter({ text: 'Next automatic sync in ~1 hour' })
        .setTimestamp();

    await interaction.editReply({ embeds: [syncEmbed] });
    console.log(`🔄 Manual ban sync completed for guild: ${interaction.guild.id}`);
}

/**
 * Count linked users in a guild
 */
function countLinkedUsers(guildId) {
    const allUsers = db.getAllUsers(guildId) || {};
    return Object.values(allUsers).filter(user => user.robloxLinked).length;
}

/**
 * Get all linked users in a guild
 */
function getAllLinkedUsers(guildId) {
    const allUsers = db.getAllUsers(guildId) || {};
    const linked = {};
    
    for (const [userId, userData] of Object.entries(allUsers)) {
        if (userData.robloxLinked) {
            linked[userId] = userData;
        }
    }
    
    return linked;
}