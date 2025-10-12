const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('⏰ Timeout a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('duration')
                .setDescription('Duration in minutes (1-40320 = 28 days max)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = interaction.guild.members.cache.get(targetUser.id);

        if (!member) {
            return interaction.reply({
                content: '❌ User not found in this server!',
                ephemeral: true
            });
        }

        if (!member.moderatable) {
            return interaction.reply({
                content: '❌ I cannot timeout this user! They may have higher permissions than me.',
                ephemeral: true
            });
        }

        if (targetUser.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ You cannot timeout yourself!',
                ephemeral: true
            });
        }

        if (targetUser.bot) {
            return interaction.reply({
                content: '❌ You cannot timeout bots!',
                ephemeral: true
            });
        }

        try {
            const timeoutDuration = duration * 60 * 1000; // Convert minutes to milliseconds
            await member.timeout(timeoutDuration, `${reason} | Timed out by ${interaction.user.tag}`);

            // Format duration for display
            const days = Math.floor(duration / 1440);
            const hours = Math.floor((duration % 1440) / 60);
            const minutes = duration % 60;
            
            let durationText = '';
            if (days > 0) durationText += `${days}d `;
            if (hours > 0) durationText += `${hours}h `;
            if (minutes > 0) durationText += `${minutes}m`;

            const timeoutEmbed = new EmbedBuilder()
                .setColor('#ffa500')
                .setTitle('⏰ User Timed Out')
                .setDescription(`**${targetUser.tag}** has been timed out.`)
                .addFields(
                    { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                    { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                    { name: '⏱️ Duration', value: durationText.trim(), inline: true },
                    { name: '📝 Reason', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [timeoutEmbed] });

            // Try to DM the user
            try {
                await targetUser.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ffa500')
                            .setTitle('⏰ You have been timed out')
                            .setDescription(`You have been timed out in **${interaction.guild.name}**`)
                            .addFields(
                                { name: '⏱️ Duration', value: durationText.trim() },
                                { name: '📝 Reason', value: reason }
                            )
                            .setTimestamp()
                    ]
                });
            } catch {
                // User has DMs disabled, ignore
            }

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to timeout user!',
                ephemeral: true
            });
        }
    }
};