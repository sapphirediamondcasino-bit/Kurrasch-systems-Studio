const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('🗑️ Delete multiple messages')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Only delete messages from this user')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const targetUser = interaction.options.getUser('user');

        await interaction.deferReply({ ephemeral: true });

        try {
            let messages = await interaction.channel.messages.fetch({ limit: amount });

            // Filter by user if specified
            if (targetUser) {
                messages = messages.filter(msg => msg.author.id === targetUser.id);
            }

            // Discord only allows deleting messages younger than 14 days
            messages = messages.filter(msg => {
                const msgAge = Date.now() - msg.createdTimestamp;
                return msgAge < 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
            });

            if (messages.size === 0) {
                return interaction.editReply({
                    content: '❌ No messages found to delete! Messages must be less than 14 days old.',
                });
            }

            const deletedMessages = await interaction.channel.bulkDelete(messages, true);

            const purgeEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🗑️ Messages Purged')
                .setDescription(`Successfully deleted **${deletedMessages.size}** message(s)`)
                .addFields(
                    { name: '📊 Requested', value: `${amount}`, inline: true },
                    { name: '✅ Deleted', value: `${deletedMessages.size}`, inline: true },
                    { name: '👮 Moderator', value: interaction.user.tag, inline: true }
                )
                .setTimestamp();

            if (targetUser) {
                purgeEmbed.addFields({
                    name: '👤 Target User',
                    value: `${targetUser.tag}`,
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [purgeEmbed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: '❌ Failed to delete messages! Make sure I have the Manage Messages permission.',
            });
        }
    }
};