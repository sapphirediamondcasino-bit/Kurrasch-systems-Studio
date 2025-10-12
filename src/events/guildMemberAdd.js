const { EmbedBuilder } = require('discord.js');
const db = require('../database/db');
const { EMOJIS, COLORS } = require('../utils/constants');
const generateImage = require('../utils/generateImage');
const chalk = require('chalk');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        console.log(chalk.cyan(`👋 New member joined: ${member.user.tag} in ${member.guild.name}`));

        try {
            const serverData = db.getServer(member.guild.id) || {};

            // Check for anti-raid measures
            if (serverData.antiRaid) {
                await handleAntiRaid(member, serverData);
            }

            // Check account age
            await checkAccountAge(member, serverData);

            // Send welcome message if configured
            if (serverData.welcomeChannel) {
                await sendWelcomeMessage(member, serverData);
            }

            // Auto-assign role if configured
            if (serverData.autoRole) {
                await assignAutoRole(member, serverData);
            }

            // Log member join
            if (serverData.logChannel) {
                await logMemberJoin(member, serverData);
            }

        } catch (error) {
            console.error(chalk.red('❌ Error handling member join:'), error);
        }
    }
};

/**
 * Handle anti-raid protection
 */
async function handleAntiRaid(member, serverData) {
    const now = Date.now();
    
    // Initialize raid tracking
    if (!serverData.recentJoins) {
        serverData.recentJoins = [];
    }

    // Remove joins older than 1 minute
    serverData.recentJoins = serverData.recentJoins.filter(
        timestamp => now - timestamp < 60000
    );

    // Add current join
    serverData.recentJoins.push(now);

    // Check if raid detected (10+ joins in 1 minute)
    if (serverData.recentJoins.length >= 10) {
        console.log(chalk.red(`🚨 RAID DETECTED in ${member.guild.name}!`));

        // Kick the new member
        try {
            await member.kick('Anti-raid protection');
            console.log(chalk.yellow(`⚠️ Kicked ${member.user.tag} (raid protection)`));
        } catch (error) {
            console.error(chalk.red('❌ Failed to kick raider:'), error);
        }

        // Alert in log channel
        if (serverData.logChannel) {
            const logChannel = member.guild.channels.cache.get(serverData.logChannel);
            
            if (logChannel) {
                const raidEmbed = new EmbedBuilder()
                    .setColor(COLORS.ERROR)
                    .setTitle(`${EMOJIS.SECURITY} RAID DETECTED`)
                    .setDescription('Multiple accounts are joining rapidly!')
                    .addFields(
                        { name: '📊 Joins (1 min)', value: `${serverData.recentJoins.length}`, inline: true },
                        { name: '⚡ Action Taken', value: 'New members kicked', inline: true },
                        { name: '💡 Recommendation', value: 'Consider enabling server lockdown', inline: false }
                    )
                    .setTimestamp();

                await logChannel.send({ embeds: [raidEmbed] });
            }
        }

        return;
    }

    // Save updated data
    db.saveServer(member.guild.id, serverData);
}

/**
 * Check if account is too new (potential alt/raid account)
 */
async function checkAccountAge(member, serverData) {
    const accountAge = Date.now() - member.user.createdTimestamp;
    const daysSinceCreation = Math.floor(accountAge / (1000 * 60 * 60 * 24));

    // Flag accounts less than 7 days old
    if (daysSinceCreation < 7) {
        console.log(chalk.yellow(`⚠️ New account detected: ${member.user.tag} (${daysSinceCreation} days old)`));

        // Log to mod channel
        if (serverData.logChannel) {
            const logChannel = member.guild.channels.cache.get(serverData.logChannel);
            
            if (logChannel) {
                const newAccountEmbed = new EmbedBuilder()
                    .setColor(COLORS.WARNING)
                    .setTitle(`${EMOJIS.WARNING} New Account Alert`)
                    .setDescription(`${member.user.tag} joined with a recently created account.`)
                    .addFields(
                        { name: '👤 User', value: `${member.user.tag} (${member.user.id})`, inline: true },
                        { name: '📅 Account Age', value: `${daysSinceCreation} days`, inline: true },
                        { name: '⚠️ Risk', value: daysSinceCreation < 3 ? 'High' : 'Medium', inline: true },
                        { name: '📅 Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: false }
                    )
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: 'Monitor this user for suspicious activity' })
                    .setTimestamp();

                await logChannel.send({ embeds: [newAccountEmbed] });
            }
        }
    }
}

/**
 * Send welcome message to new member
 */
async function sendWelcomeMessage(member, serverData) {
    try {
        const welcomeChannel = member.guild.channels.cache.get(serverData.welcomeChannel);
        
        if (!welcomeChannel) return;

        const welcomeEmbed = new EmbedBuilder()
            .setColor(COLORS.SUCCESS)
            .setTitle(`${EMOJIS.SUCCESS} Welcome to ${member.guild.name}!`)
            .setDescription(
                serverData.welcomeMessage || 
                `Welcome ${member.user}, we're glad to have you here! Please read the rules and enjoy your stay.`
            )
            .addFields(
                { name: '👤 Member', value: member.user.tag, inline: true },
                { name: '📊 Member #', value: `${member.guild.memberCount}`, inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `User ID: ${member.user.id}` })
            .setTimestamp();

        await welcomeChannel.send({ embeds: [welcomeEmbed] });
        console.log(chalk.green(`✅ Welcome message sent for ${member.user.tag}`));

    } catch (error) {
        console.error(chalk.red('❌ Failed to send welcome message:'), error);
    }
}

/**
 * Auto-assign role to new member
 */
async function assignAutoRole(member, serverData) {
    try {
        const role = member.guild.roles.cache.get(serverData.autoRole);
        
        if (!role) {
            console.log(chalk.yellow(`⚠️ Auto-role not found in ${member.guild.name}`));
            return;
        }

        await member.roles.add(role);
        console.log(chalk.green(`✅ Assigned ${role.name} to ${member.user.tag}`));

    } catch (error) {
        console.error(chalk.red('❌ Failed to assign auto-role:'), error);
    }
}

/**
 * Log member join to log channel
 */
async function logMemberJoin(member, serverData) {
    try {
        const logChannel = member.guild.channels.cache.get(serverData.logChannel);
        
        if (!logChannel) return;

        const accountAge = Date.now() - member.user.createdTimestamp;
        const daysSinceCreation = Math.floor(accountAge / (1000 * 60 * 60 * 24));

        const joinEmbed = new EmbedBuilder()
            .setColor(COLORS.SUCCESS)
            .setTitle(`${EMOJIS.USER} Member Joined`)
            .setDescription(`${member.user.tag} joined the server`)
            .addFields(
                { name: '👤 User', value: `${member.user.tag}`, inline: true },
                { name: '🆔 User ID', value: member.user.id, inline: true },
                { name: '📊 Member Count', value: `${member.guild.memberCount}`, inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '⚠️ Account Age', value: `${daysSinceCreation} days`, inline: true },
                { name: '🤖 Bot', value: member.user.bot ? 'Yes' : 'No', inline: true }
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'Member Join Log' })
            .setTimestamp();

        await logChannel.send({ embeds: [joinEmbed] });

    } catch (error) {
        console.error(chalk.red('❌ Failed to log member join:'), error);
    }
}