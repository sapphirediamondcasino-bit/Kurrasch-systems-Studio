const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('📚 View all available commands and features'),
    
    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setColor('#00d9ff')
            .setTitle('🛡️ Game Killer\'s Security™ - Command List')
            .setDescription('Here are all available commands for this bot!')
            .addFields(
                {
                    name: '📊 **Information**',
                    value: '`/ping` - Check bot latency\n`/help` - Show this menu',
                    inline: false
                },
                {
                    name: '🛡️ **Moderation**',
                    value: '`/ban` - Ban a user\n`/kick` - Kick a user\n`/warn` - Warn a user\n`/timeout` - Timeout a user\n`/purge` - Delete messages',
                    inline: false
                },
                {
                    name: '🔒 **Security**',
                    value: '`/report` - Report a user\n`/check` - Check user flags\n`/logs` - View security logs',
                    inline: false
                },
                {
                    name: '📊 **Dashboard**',
                    value: '`/dashboard` - View basic dashboard\n`/prodash` - View pro dashboard\n`/settings` - Configure server settings',
                    inline: false
                },
                {
                    name: '💎 **Subscription**',
                    value: '`/subscribe` - Manage subscription\n`/features` - View tier features',
                    inline: false
                },
                {
                    name: '🎮 **Roblox Integration**',
                    value: '`/verify` - Link Roblox account\n`/unlink` - Unlink Roblox account\n`/syncbans` - Sync Roblox bans',
                    inline: false
                }
            )
            .setFooter({ text: 'Game Killer\'s Security™' })
            .setTimestamp();

        await interaction.reply({ embeds: [helpEmbed] });
    }
};