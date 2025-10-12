const { ActivityType } = require('discord.js');
const chalk = require('chalk');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(chalk.green('✅ Bot is online!'));
        console.log(chalk.cyan(`📝 Logged in as: ${client.user.tag}`));
        console.log(chalk.cyan(`🌐 Connected to ${client.guilds.cache.size} servers`));
        console.log(chalk.cyan(`👥 Watching ${client.users.cache.size} users`));
        
        // Set bot status
        client.user.setPresence({
            activities: [{
                name: '🛡️ Protecting your server',
                type: ActivityType.Watching
            }],
            status: 'online'
        });

        console.log(chalk.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log(chalk.green('🚀 Game Killer\'s Security is ready!'));
        console.log(chalk.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    }
};