const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('⚙️ Configure server security settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        try {
            const serverData = db.getServer(interaction.guild.id) || {};

            // Initialize default settings if not exist
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
                db.saveServer(interaction.guild.id, serverData);
            }

            // Get website URL from environment or use default
            const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:25974';

            // Create main settings embed
            const settingsEmbed = new EmbedBuilder()
                .setColor('#00d9ff')
                .setTitle('⚙️ Server Security Settings')
                .setDescription(`Configure security settings for **${interaction.guild.name}**\n\n` +
                               `Select a category below to view and modify settings.\n` +
                               `🌐 **[Manage Settings on Web Dashboard](${websiteUrl}/login)**`)
                .addFields(
                    {
                        name: '🛡️ Security',
                        value: `**Auto-Mod:** ${serverData.settings.autoMod ? '✅ Enabled' : '❌ Disabled'}\n` +
                               `**Security Level:** ${serverData.settings.securityLevel}\n` +
                               `**Anti-Spam:** ${serverData.settings.antiSpam ? '✅ Enabled' : '❌ Disabled'}\n` +
                               `**Anti-Raid:** ${serverData.settings.antiRaid ? '✅ Enabled' : '❌ Disabled'}`,
                        inline: true
                    },
                    {
                        name: '🔍 Filters',
                        value: `**Link Filter:** ${serverData.settings.linkFilter ? '✅ Enabled' : '❌ Disabled'}\n` +
                               `**Word Filter:** ${serverData.settings.wordFilter ? '✅ Enabled' : '❌ Disabled'}\n` +
                               `**Auto-Timeout:** ${serverData.settings.autoTimeout ? '✅ Enabled' : '❌ Disabled'}`,
                        inline: true
                    },
                    {
                        name: '📊 Channels',
                        value: `**Log Channel:** ${serverData.settings.logChannel ? `<#${serverData.settings.logChannel}>` : 'Not Set'}\n` +
                               `**Report Channel:** ${serverData.settings.reportChannel ? `<#${serverData.settings.reportChannel}>` : 'Not Set'}\n` +
                               `**Welcome Channel:** ${serverData.settings.welcomeChannel ? `<#${serverData.settings.welcomeChannel}>` : 'Not Set'}`,
                        inline: false
                    },
                    {
                        name: '⚠️ Moderation',
                        value: `**Max Warnings:** ${serverData.settings.maxWarnings}\n` +
                               `**Timeout Duration:** ${serverData.settings.timeoutDuration} minutes`,
                        inline: true
                    }
                )
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({ text: 'Game Killer\'s Security™ | Use web dashboard for easier configuration' })
                .setTimestamp();

            // Create web dashboard button (first row)
            const webButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('🌐 Open Settings on Web')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`${websiteUrl}/login`)
                        .setEmoji('⚙️')
                );

            // Create category select menu (second row)
            const categoryMenu = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('settings_category')
                        .setPlaceholder('📋 Select a settings category')
                        .addOptions([
                            {
                                label: 'Security Settings',
                                description: 'Auto-mod, security level, anti-spam',
                                value: 'security',
                                emoji: '🛡️'
                            },
                            {
                                label: 'Filter Settings',
                                description: 'Link filter, word filter, content moderation',
                                value: 'filters',
                                emoji: '🔍'
                            },
                            {
                                label: 'Channel Settings',
                                description: 'Configure log, report, and welcome channels',
                                value: 'channels',
                                emoji: '📊'
                            },
                            {
                                label: 'Moderation Settings',
                                description: 'Warnings, timeouts, auto-actions',
                                value: 'moderation',
                                emoji: '⚠️'
                            },
                            {
                                label: 'Advanced Settings',
                                description: 'AI detection, Roblox sync, custom rules',
                                value: 'advanced',
                                emoji: '🔧'
                            }
                        ])
                );

            // Create action buttons (third row)
            const actionButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('settings_save')
                        .setLabel('Save Changes')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('💾'),
                    new ButtonBuilder()
                        .setCustomId('settings_reset')
                        .setLabel('Reset to Default')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔄'),
                    new ButtonBuilder()
                        .setCustomId('settings_export')
                        .setLabel('Export Config')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('📥')
                );

            await interaction.reply({
                embeds: [settingsEmbed],
                components: [webButton, categoryMenu, actionButtons]
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to load settings!',
                ephemeral: true
            });
        }
    }
};