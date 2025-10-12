const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../database/db');
const { EMOJIS, COLORS, DEFAULT_SETTINGS } = require('../utils/constants');
const chalk = require('chalk');

module.exports = {
    name: 'guildCreate',
    async execute(guild) {
        console.log(chalk.green(`✅ Joined new server: ${guild.name} (${guild.id})`));
        console.log(chalk.cyan(`📊 Server has ${guild.memberCount} members`));

        try {
            // Initialize server in database with default settings
            const serverData = {
                guildId: guild.id,
                guildName: guild.name,
                tier: 'Free',
                joinedAt: new Date().toISOString(),
                ...DEFAULT_SETTINGS
            };

            db.saveServer(guild.id, serverData);
            console.log(chalk.green(`✅ Database initialized for ${guild.name}`));

            // Find a suitable channel to send welcome message
            const welcomeChannel = findWelcomeChannel(guild);

            if (welcomeChannel) {
                // Create welcome embed
                const welcomeEmbed = new EmbedBuilder()
                    .setColor(COLORS.SUCCESS)
                    .setTitle(`${EMOJIS.SHIELD} Thanks for adding Game Killer's Security™!`)
                    .setDescription(
                        `Hello **${guild.name}**! I'm here to help keep your server safe and secure.\n\n` +
                        `I've been set up with default settings, but you can customize everything to fit your needs.`
                    )
                    .addFields(
                        {
                            name: '🚀 Quick Start',
                            value: '• Use `/help` to see all available commands\n' +
                                   '• Use `/dashboard` to view server statistics\n' +
                                   '• Use `/settings` to configure the bot',
                            inline: false
                        },
                        {
                            name: '🛡️ Key Features',
                            value: '• **Moderation:** Ban, kick, warn, timeout, and purge\n' +
                                   '• **Security:** User reports and security checks\n' +
                                   '• **Auto-Mod:** Automatic spam and content filtering\n' +
                                   '• **Dashboard:** Real-time server security overview',
                            inline: false
                        },
                        {
                            name: '⚙️ Current Settings',
                            value: `• **Auto-Mod:** ${DEFAULT_SETTINGS.autoMod ? 'Enabled' : 'Disabled'}\n` +
                                   `• **Security Level:** ${DEFAULT_SETTINGS.securityLevel}\n` +
                                   `• **Link Filter:** ${DEFAULT_SETTINGS.linkFilter ? 'Enabled' : 'Disabled'}\n` +
                                   `• **Tier:** Free`,
                            inline: false
                        },
                        {
                            name: '💎 Want More Features?',
                            value: 'Upgrade to **Pro** for:\n' +
                                   '• Advanced analytics dashboard\n' +
                                   '• AI threat detection\n' +
                                   '• Roblox ban syncing\n' +
                                   '• Priority support\n\n' +
                                   'Use `/subscribe` to learn more!',
                            inline: false
                        }
                    )
                    .setThumbnail(guild.iconURL({ dynamic: true }))
                    .setFooter({ text: 'Need help? Use /help or join our support server' })
                    .setTimestamp();

                // Create action buttons
                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('setup_dashboard')
                            .setLabel('View Dashboard')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('📊'),
                        new ButtonBuilder()
                            .setCustomId('setup_settings')
                            .setLabel('Configure Settings')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('⚙️'),
                        new ButtonBuilder()
                            .setCustomId('setup_help')
                            .setLabel('Get Help')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('❓')
                    );

                // Send welcome message
                await welcomeChannel.send({
                    embeds: [welcomeEmbed],
                    components: [buttons]
                });

                console.log(chalk.green(`✅ Welcome message sent to ${welcomeChannel.name}`));
            } else {
                console.log(chalk.yellow(`⚠️ No suitable channel found to send welcome message in ${guild.name}`));
            }

            // Log to console
            console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
            console.log(chalk.green(`✅ Successfully joined ${guild.name}`));
            console.log(chalk.cyan(`📊 Total servers: ${guild.client.guilds.cache.size}`));
            console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

        } catch (error) {
            console.error(chalk.red(`❌ Error setting up server ${guild.name}:`), error);
        }
    }
};

/**
 * Find the most suitable channel to send welcome message
 */
function findWelcomeChannel(guild) {
    // Priority order for channel selection
    const channelNames = ['general', 'chat', 'main', 'lobby', 'welcome'];
    
    // Try to find channel by name
    for (const name of channelNames) {
        const channel = guild.channels.cache.find(
            ch => ch.name.toLowerCase().includes(name) && 
                  ch.isTextBased() && 
                  ch.permissionsFor(guild.members.me).has('SendMessages')
        );
        if (channel) return channel;
    }

    // If no named channel found, get first text channel where bot can send messages
    const firstAvailable = guild.channels.cache.find(
        ch => ch.isTextBased() && 
              ch.permissionsFor(guild.members.me).has('SendMessages')
    );

    return firstAvailable || null;
}