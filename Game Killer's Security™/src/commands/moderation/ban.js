const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('🔨 Ban a user from the server')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    
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

        if (!member.bannable) {
            return interaction.reply({
                content: '❌ I cannot ban this user! They may have higher permissions than me.',
                ephemeral: true
            });
        }

        if (targetUser.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ You cannot ban yourself!',
                ephemeral: true
            });
        }

        try {
            await member.ban({ reason: `${reason} | Banned by ${interaction.user.tag}` });

            const banEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🔨 User Banned')
                .setDescription(`**${targetUser.tag}** has been banned from the server.`)
                .addFields(
                    { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                    { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                    { name: '📝 Reason', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [banEmbed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to ban user!',
                ephemeral: true
            });
        }
    }
};