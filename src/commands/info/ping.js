const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('🏓 Check the bot\'s latency and response time'),
    
    async execute(interaction) {
        const sent = await interaction.reply({ 
            content: '🏓 Pinging...', 
            fetchReply: true 
        });

        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        await interaction.editReply({
            content: `🏓 **Pong!**\n\n` +
                     `📡 **Bot Latency:** ${latency}ms\n` +
                     `💓 **API Latency:** ${apiLatency}ms\n` +
                     `⏱️ **Status:** ${apiLatency < 200 ? '✅ Excellent' : apiLatency < 500 ? '⚠️ Good' : '❌ Slow'}`
        });
    }
};