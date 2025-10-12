const { InteractionType } = require('discord.js');
const chalk = require('chalk');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        
        // Handle Slash Commands
        if (interaction.type === InteractionType.ApplicationCommand) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.log(chalk.red(`❌ Command not found: ${interaction.commandName}`));
                return;
            }

            try {
                console.log(chalk.blue(`⚡ Command used: /${interaction.commandName} by ${interaction.user.tag}`));
                await command.execute(interaction);
            } catch (error) {
                console.error(chalk.red('❌ Command execution error:'), error);
                
                const errorMessage = {
                    content: '❌ There was an error executing this command!',
                    ephemeral: true
                };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        }

        // Handle Button Interactions
        if (interaction.isButton()) {
            const buttonId = interaction.customId;
            console.log(chalk.magenta(`🔘 Button pressed: ${buttonId} by ${interaction.user.tag}`));

            // Button handlers will be loaded here later
            const buttonHandler = interaction.client.buttons?.get(buttonId);
            
            if (buttonHandler) {
                try {
                    await buttonHandler.execute(interaction);
                } catch (error) {
                    console.error(chalk.red('❌ Button handler error:'), error);
                    await interaction.reply({
                        content: '❌ There was an error processing this button!',
                        ephemeral: true
                    });
                }
            }
        }

        // Handle Modal Submissions
        if (interaction.isModalSubmit()) {
            const modalId = interaction.customId;
            console.log(chalk.yellow(`📝 Modal submitted: ${modalId} by ${interaction.user.tag}`));

            // Modal handlers will be loaded here later
            const modalHandler = interaction.client.modals?.get(modalId);
            
            if (modalHandler) {
                try {
                    await modalHandler.execute(interaction);
                } catch (error) {
                    console.error(chalk.red('❌ Modal handler error:'), error);
                    await interaction.reply({
                        content: '❌ There was an error processing this form!',
                        ephemeral: true
                    });
                }
            }
        }

        // Handle Select Menus
        if (interaction.isStringSelectMenu()) {
            const menuId = interaction.customId;
            console.log(chalk.cyan(`📋 Select menu used: ${menuId} by ${interaction.user.tag}`));

            // Select menu handlers will be loaded here later
            const menuHandler = interaction.client.selectMenus?.get(menuId);
            
            if (menuHandler) {
                try {
                    await menuHandler.execute(interaction);
                } catch (error) {
                    console.error(chalk.red('❌ Select menu handler error:'), error);
                    await interaction.reply({
                        content: '❌ There was an error processing this menu!',
                        ephemeral: true
                    });
                }
            }
        }
    }
};