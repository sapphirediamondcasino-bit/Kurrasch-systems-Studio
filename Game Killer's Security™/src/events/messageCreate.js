const { EmbedBuilder } = require('discord.js');
const db = require('../database/db');
const { AUTO_MOD, PATTERNS, EMOJIS, COLORS } = require('../utils/constants');
const chalk = require('chalk');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Ignore bot messages
        if (message.author.bot) return;

        // Ignore DMs
        if (!message.guild) return;

        try {
            // Get server settings
            const serverData = db.getServer(message.guild.id) || {};

            // Check if auto-mod is enabled
            if (!serverData.autoMod) return;

            // Run auto-moderation checks
            const violations = [];

            // Check for spam
            if (await checkSpam(message)) {
                violations.push('Spam detected');
            }

            // Check for excessive mentions
            if (checkMentions(message)) {
                violations.push('Excessive mentions');
            }

            // Check for links (if link filter enabled)
            if (serverData.linkFilter && checkLinks(message)) {
                violations.push('Unauthorized link');
            }

            // Check for excessive caps
            if (checkCaps(message)) {
                violations.push('Excessive caps');
            }

            // Check for excessive emojis
            if (checkEmojis(message)) {
                violations.push('Excessive emojis');
            }

            // Check for banned words (if word filter enabled)
            if (serverData.wordFilter && checkBannedWords(message, serverData)) {
                violations.push('Banned word detected');
            }

            // Check for Discord invites (if enabled)
            if (serverData.blockInvites && checkDiscordInvites(message)) {
                violations.push('Discord invite link');
            }

            // Take action if violations found
            if (violations.length > 0) {
                await handleViolations(message, violations, serverData);
            }

        } catch (error) {
            console.error(chalk.red('❌ Auto-mod error:'), error);
        }
    }
};

/**
 * Check for spam (multiple messages in short time)
 */
async function checkSpam(message) {
    const userId = message.author.id;
    const guildId = message.guild.id;
    
    // Get user data
    const userData = db.getUser(guildId, userId) || {};
    
    // Initialize spam tracking
    if (!userData.recentMessages) {
        userData.recentMessages = [];
    }

    const now = Date.now();
    const timeWindow = AUTO_MOD.SPAM_TIME_WINDOW;

    // Remove old messages outside time window
    userData.recentMessages = userData.recentMessages.filter(
        timestamp => now - timestamp < timeWindow
    );

    // Add current message
    userData.recentMessages.push(now);

    // Check if spam threshold exceeded
    const isSpam = userData.recentMessages.length > AUTO_MOD.SPAM_MESSAGE_COUNT;

    // Save updated data
    db.saveUser(guildId, userId, userData);

    return isSpam;
}

/**
 * Check for excessive mentions
 */
function checkMentions(message) {
    const mentions = message.mentions.users.size + message.mentions.roles.size;
    return mentions > AUTO_MOD.MAX_MENTIONS;
}

/**
 * Check for links
 */
function checkLinks(message) {
    const urlMatches = message.content.match(PATTERNS.URL);
    return urlMatches && urlMatches.length > AUTO_MOD.MAX_LINKS;
}

/**
 * Check for excessive caps
 */
function checkCaps(message) {
    const content = message.content;
    if (content.length < 10) return false; // Ignore short messages

    const capsCount = (content.match(/[A-Z]/g) || []).length;
    const totalLetters = (content.match(/[a-zA-Z]/g) || []).length;

    if (totalLetters === 0) return false;

    const capsPercentage = (capsCount / totalLetters) * 100;
    return capsPercentage > AUTO_MOD.CAPS_PERCENTAGE;
}

/**
 * Check for excessive emojis
 */
function checkEmojis(message) {
    const customEmojis = (message.content.match(PATTERNS.EMOJI) || []).length;
    const unicodeEmojis = (message.content.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
    
    const totalEmojis = customEmojis + unicodeEmojis;
    return totalEmojis > AUTO_MOD.MAX_EMOJIS;
}

/**
 * Check for banned words
 */
function checkBannedWords(message, serverData) {
    if (!serverData.bannedWords || serverData.bannedWords.length === 0) {
        return false;
    }

    const content = message.content.toLowerCase();
    
    for (const word of serverData.bannedWords) {
        if (content.includes(word.toLowerCase())) {
            return true;
        }
    }

    return false;
}

/**
 * Check for Discord invite links
 */
function checkDiscordInvites(message) {
    return PATTERNS.DISCORD_INVITE.test(message.content);
}

/**
 * Handle violations
 */
async function handleViolations(message, violations, serverData) {
    try {
        // Delete the message
        await message.delete().catch(() => {});

        // Get user data
        const userData = db.getUser(message.guild.id, message.author.id) || {
            userId: message.author.id,
            autoModViolations: 0,
            infractions: 0
        };

        // Increment violation count
        userData.autoModViolations = (userData.autoModViolations || 0) + 1;
        userData.infractions = (userData.infractions || 0) + 1;

        // Save user data
        db.saveUser(message.guild.id, message.author.id, userData);

        // Send warning to user
        const warningEmbed = new EmbedBuilder()
            .setColor(COLORS.WARNING)
            .setTitle(`${EMOJIS.WARNING} Auto-Moderation Warning`)
            .setDescription('Your message was removed for violating server rules.')
            .addFields(
                {
                    name: '🚫 Violations Detected',
                    value: violations.map(v => `• ${v}`).join('\n'),
                    inline: false
                },
                {
                    name: '📊 Total Violations',
                    value: `${userData.autoModViolations}`,
                    inline: true
                },
                {
                    name: '⚠️ Warning',
                    value: 'Continued violations may result in timeout or ban',
                    inline: false
                }
            )
            .setFooter({ text: `${message.guild.name} • Auto-Moderation` })
            .setTimestamp();

        // Try to DM user
        try {
            await message.author.send({ embeds: [warningEmbed] });
        } catch {
            // User has DMs disabled, send to channel instead
            const channelWarning = await message.channel.send({
                content: `${message.author}, your message was removed by auto-moderation.`,
                embeds: [warningEmbed]
            });

            // Delete warning after 10 seconds
            setTimeout(() => channelWarning.delete().catch(() => {}), 10000);
        }

        // Log to mod channel if configured
        if (serverData.logChannel) {
            const logChannel = message.guild.channels.cache.get(serverData.logChannel);
            
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor(COLORS.WARNING)
                    .setTitle(`${EMOJIS.SECURITY} Auto-Mod Action`)
                    .setDescription(`Message deleted in ${message.channel}`)
                    .addFields(
                        { name: '👤 User', value: `${message.author.tag} (${message.author.id})`, inline: true },
                        { name: '📊 Violations', value: `${userData.autoModViolations}`, inline: true },
                        { name: '🚫 Reasons', value: violations.map(v => `• ${v}`).join('\n'), inline: false },
                        { name: '💬 Message Content', value: message.content.substring(0, 1000) || 'No text content', inline: false }
                    )
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] });
            }
        }

        // Auto-timeout if too many violations
        if (serverData.autoTimeout && userData.autoModViolations >= 5) {
            try {
                const member = message.guild.members.cache.get(message.author.id);
                if (member && member.moderatable) {
                    await member.timeout(10 * 60 * 1000, 'Excessive auto-mod violations'); // 10 minutes

                    const timeoutEmbed = new EmbedBuilder()
                        .setColor(COLORS.ERROR)
                        .setTitle(`${EMOJIS.TIMEOUT} Auto-Timeout`)
                        .setDescription(`${message.author.tag} has been timed out for 10 minutes due to excessive violations.`)
                        .setTimestamp();

                    if (serverData.logChannel) {
                        const logChannel = message.guild.channels.cache.get(serverData.logChannel);
                        if (logChannel) {
                            await logChannel.send({ embeds: [timeoutEmbed] });
                        }
                    }
                }
            } catch (error) {
                console.error(chalk.red('❌ Auto-timeout failed:'), error);
            }
        }

        console.log(chalk.yellow(`⚠️ Auto-mod: ${message.author.tag} - ${violations.join(', ')}`));

    } catch (error) {
        console.error(chalk.red('❌ Error handling violations:'), error);
    }
}