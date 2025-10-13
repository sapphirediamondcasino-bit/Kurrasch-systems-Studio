/**
 * Deploy Commands Script
 * Registers all slash commands with Discord
 */

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, '../src/commands');

// Load all command files
function loadCommands(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Recursively load commands from subdirectories
            loadCommands(filePath);
        } else if (file.endsWith('.js')) {
            try {
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                    console.log(chalk.green(`✅ Loaded command: ${command.data.name}`));
                } else {
                    console.log(chalk.yellow(`⚠️  Skipped ${file}: Missing 'data' or 'execute' property`));
                }
            } catch (error) {
                console.error(chalk.red(`❌ Error loading ${file}:`), error.message);
            }
        }
    }
}

async function deployCommands() {
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.cyan('🚀 Game Killer\'s Security™ - Command Deployment'));
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log();

    // Check for required environment variables
    if (!process.env.DISCORD_TOKEN) {
        console.error(chalk.red('❌ Missing DISCORD_TOKEN in .env file!'));
        process.exit(1);
    }

    if (!process.env.CLIENT_ID) {
        console.error(chalk.red('❌ Missing CLIENT_ID in .env file!'));
        process.exit(1);
    }

    console.log(chalk.blue('📂 Loading commands...'));
    console.log();

    // Load all commands
    loadCommands(commandsPath);

    console.log();
    console.log(chalk.green(`✅ Loaded ${commands.length} commands total`));
    console.log();

    // Construct and prepare an instance of the REST module
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    try {
        console.log(chalk.blue(`🔄 Started refreshing ${commands.length} application (/) commands...`));
        console.log();

        // Determine deployment scope
        if (process.env.GUILD_ID) {
            // Deploy to specific guild (faster for testing)
            console.log(chalk.yellow(`📍 Deploying to guild: ${process.env.GUILD_ID} (Testing Mode)`));
            
            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );

            console.log(chalk.green(`✅ Successfully registered ${data.length} guild commands!`));
        } else {
            // Deploy globally (takes up to 1 hour to update)
            console.log(chalk.yellow('🌍 Deploying globally (may take up to 1 hour to update)...'));
            
            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );

            console.log(chalk.green(`✅ Successfully registered ${data.length} global commands!`));
        }

        console.log();
        console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log(chalk.green('✅ Command deployment completed successfully!'));
        console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log();
        console.log(chalk.blue('💡 Commands registered:'));
        
        // List all deployed commands
        commands.forEach(cmd => {
            console.log(chalk.gray(`   • /${cmd.name} - ${cmd.description}`));
        });

        console.log();
        console.log(chalk.green('🎉 You can now use the commands in Discord!'));
        
        if (process.env.GUILD_ID) {
            console.log(chalk.yellow('⚠️  Note: Guild commands update instantly. Remove GUILD_ID from .env for global deployment.'));
        } else {
            console.log(chalk.yellow('⚠️  Note: Global commands may take up to 1 hour to appear in all servers.'));
        }

    } catch (error) {
        console.error(chalk.red('❌ Error deploying commands:'));
        console.error(error);
        process.exit(1);
    }
}

// Run deployment
deployCommands();

// Export for programmatic use
module.exports = { deployCommands };