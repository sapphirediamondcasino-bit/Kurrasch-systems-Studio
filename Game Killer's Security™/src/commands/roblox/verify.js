const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database/db');
const { EMOJIS, COLORS } = require('../../utils/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('🎮 Link your Roblox account to Discord')
        .addStringOption(option =>
            option
                .setName('username')
                .setDescription('Your Roblox username')
                .setRequired(true)),
    
    async execute(interaction) {
        const robloxUsername = interaction.options.getString('username');

        try {
            // Check if user is already verified
            const userData = db.getUser(interaction.guild.id, interaction.user.id) || {};
            
            if (userData.robloxLinked) {
                const alreadyLinkedEmbed = new EmbedBuilder()
                    .setColor(COLORS.WARNING)
                    .setTitle(`${EMOJIS.WARNING} Already Verified`)
                    .setDescription('Your Discord account is already linked to a Roblox account.')
                    .addFields(
                        { name: '🎮 Linked Account', value: userData.robloxUsername || 'Unknown', inline: true },
                        { name: '📅 Linked Since', value: userData.robloxLinkedDate ? `<t:${Math.floor(new Date(userData.robloxLinkedDate).getTime() / 1000)}:R>` : 'Unknown', inline: true }
                    )
                    .setFooter({ text: 'Use /unlink to unlink your current account' })
                    .setTimestamp();

                const unlinkButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('roblox_unlink')
                            .setLabel('Unlink Account')
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('🔓')
                    );

                return interaction.reply({
                    embeds: [alreadyLinkedEmbed],
                    components: [unlinkButton],
                    ephemeral: true
                });
            }

            // Generate verification code
            const verificationCode = generateVerificationCode();
            
            // Store verification data temporarily (in real implementation, use cache/redis)
            if (!userData.pendingVerification) {
                userData.pendingVerification = {};
            }
            
            userData.pendingVerification = {
                code: verificationCode,
                username: robloxUsername,
                timestamp: new Date().toISOString(),
                expires: Date.now() + (15 * 60 * 1000) // 15 minutes
            };

            db.saveUser(interaction.guild.id, interaction.user.id, userData);

            // Create verification embed
            const verifyEmbed = new EmbedBuilder()
                .setColor(COLORS.INFO)
                .setTitle(`${EMOJIS.KEY} Roblox Account Verification`)
                .setDescription(`To link your Roblox account **${robloxUsername}**, follow these steps:`)
                .addFields(
                    {
                        name: '📝 Step 1: Copy Your Code',
                        value: `\`\`\`${verificationCode}\`\`\``,
                        inline: false
                    },
                    {
                        name: '🎮 Step 2: Update Your Roblox Profile',
                        value: '1. Go to [Roblox.com](https://www.roblox.com)\n' +
                               '2. Click on your profile\n' +
                               '3. Click "About" section\n' +
                               '4. Paste the code in your description\n' +
                               '5. Save changes',
                        inline: false
                    },
                    {
                        name: '✅ Step 3: Verify',
                        value: 'Click the "Verify Now" button below once you\'ve updated your profile',
                        inline: false
                    },
                    {
                        name: '⏱️ Code Expires',
                        value: '<t:' + Math.floor((Date.now() + 15 * 60 * 1000) / 1000) + ':R>',
                        inline: true
                    },
                    {
                        name: '🎮 Username',
                        value: robloxUsername,
                        inline: true
                    }
                )
                .setFooter({ text: 'Keep this message private to protect your verification code' })
                .setTimestamp();

            const verifyButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`verify_check_${interaction.user.id}`)
                        .setLabel('Verify Now')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('✅'),
                    new ButtonBuilder()
                        .setCustomId(`verify_cancel_${interaction.user.id}`)
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('❌'),
                    new ButtonBuilder()
                        .setLabel('Need Help?')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://www.roblox.com/my/profile')
                        .setEmoji('❓')
                );

            await interaction.reply({
                embeds: [verifyEmbed],
                components: [verifyButtons],
                ephemeral: true
            });

            // Log verification attempt
            console.log(`🎮 Verification started: ${interaction.user.tag} -> ${robloxUsername}`);

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to start verification process! Please try again.',
                ephemeral: true
            });
        }
    }
};

/**
 * Generate a random verification code
 */
function generateVerificationCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'VERIFY-';
    
    for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return code;
}