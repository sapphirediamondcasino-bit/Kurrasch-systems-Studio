const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('👢 Kick a user from the server')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = interaction.guild.members.cache.get(targetUser.id);

        if (!member) {
            return interaction.reply({
                content: '❌ User not found in this server!',
                ephemeral: true
            });
        }

        if (!member.kickable) {
            return interaction.reply({
                content: '❌ I cannot kick this user! They may have higher permissions than me.',
                ephemeral: true
            });
        }

        if (targetUser.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ You cannot kick yourself!',
                ephemeral: true
            });
        }

        try {
            await member.kick(`${reason} | Kicked by ${interaction.user.tag}`);

            const kickEmbed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('👢 User Kicked')
                .setDescription(`**${targetUser.tag}** has been kicked from the server.`)
                .addFields(
                    { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                    { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                    { name: '📝 Reason', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [kickEmbed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to kick user!',
                ephemeral: true
            });
        }
    }
};