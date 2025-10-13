// Game Killers Studio - Discord Integration
// Complete Discord bot integration and OAuth

const axios = require('axios');
const { users } = require('./datastore');

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const DISCORD_BOT_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_API_BASE = 'https://discord.com/api/v10';

// Get Discord OAuth URL
function getDiscordOAuthURL() {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email guilds',
  });
  
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

// Exchange code for access token
async function exchangeCode(code) {
  try {
    const response = await axios.post(
      `${DISCORD_API_BASE}/oauth2/token`,
      new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error exchanging Discord code:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Discord');
  }
}

// Get Discord user info
async function getDiscordUser(accessToken) {
  try {
    const response = await axios.get(`${DISCORD_API_BASE}/users/@me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching Discord user:', error.response?.data || error.message);
    throw new Error('Failed to fetch Discord user');
  }
}

// Get user's Discord guilds
async function getDiscordGuilds(accessToken) {
  try {
    const response = await axios.get(`${DISCORD_API_BASE}/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching Discord guilds:', error);
    return [];
  }
}

// Link Discord account to user
async function linkDiscordAccount(userId, code) {
  try {
    const tokenData = await exchangeCode(code);
    const discordUser = await getDiscordUser(tokenData.access_token);
    
    const user = await users.getById(userId);
    if (!user) throw new Error('User not found');

    // Update user with Discord info
    await users.update(userId, {
      discordId: discordUser.id,
      discordUsername: `${discordUser.username}#${discordUser.discriminator}`,
      discordLinked: true,
      discordLinkedAt: new Date().toISOString(),
      discordAccessToken: tokenData.access_token,
      discordRefreshToken: tokenData.refresh_token,
    });

    return {
      success: true,
      discordUser,
    };
  } catch (error) {
    console.error('Error linking Discord account:', error);
    throw error;
  }
}

// Send message via Discord bot
async function sendDiscordMessage(channelId, content) {
  try {
    const response = await axios.post(
      `${DISCORD_API_BASE}/channels/${channelId}/messages`,
      { content },
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error sending Discord message:', error.response?.data || error.message);
    return null;
  }
}

// Send embed message via Discord bot
async function sendDiscordEmbed(channelId, embed) {
  try {
    const response = await axios.post(
      `${DISCORD_API_BASE}/channels/${channelId}/messages`,
      { embeds: [embed] },
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error sending Discord embed:', error);
    return null;
  }
}

// Get Discord bot status
async function getBotStatus() {
  try {
    const response = await axios.get(`${DISCORD_API_BASE}/users/@me`, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
    });
    
    return {
      online: true,
      bot: response.data,
    };
  } catch (error) {
    console.error('Error getting bot status:', error);
    return {
      online: false,
      bot: null,
    };
  }
}

// Notify Discord channel of new user registration
async function notifyNewUser(user) {
  try {
    const channelId = process.env.DISCORD_NOTIFICATIONS_CHANNEL;
    if (!channelId) return;

    const embed = {
      title: '🎉 New User Registered!',
      description: `**${user.username}** just joined Game Killers Studio!`,
      color: 0x00ff00,
      fields: [
        { name: 'Username', value: user.username, inline: true },
        { name: 'Email', value: user.email, inline: true },
      ],
      timestamp: new Date().toISOString(),
    };

    await sendDiscordEmbed(channelId, embed);
  } catch (error) {
    console.error('Error notifying Discord of new user:', error);
  }
}

// Notify Discord of moderation action
async function notifyModeration(action, details) {
  try {
    const channelId = process.env.DISCORD_MODERATION_CHANNEL;
    if (!channelId) return;

    const embed = {
      title: '⚠️ Moderation Action',
      description: action,
      color: 0xff0000,
      fields: Object.keys(details).map(key => ({
        name: key,
        value: String(details[key]),
        inline: true,
      })),
      timestamp: new Date().toISOString(),
    };

    await sendDiscordEmbed(channelId, embed);
  } catch (error) {
    console.error('Error notifying Discord of moderation:', error);
  }
}

// Check if user is in Game Killers Discord server
async function isInGameKillersServer(userId) {
  try {
    const user = await users.getById(userId);
    if (!user?.discordAccessToken) return false;

    const guilds = await getDiscordGuilds(user.discordAccessToken);
    const gameKillersGuildId = process.env.DISCORD_GUILD_ID;
    
    return guilds.some(guild => guild.id === gameKillersGuildId);
  } catch (error) {
    console.error('Error checking Discord server membership:', error);
    return false;
  }
}

module.exports = {
  getDiscordOAuthURL,
  exchangeCode,
  getDiscordUser,
  getDiscordGuilds,
  linkDiscordAccount,
  sendDiscordMessage,
  sendDiscordEmbed,
  getBotStatus,
  notifyNewUser,
  notifyModeration,
  isInGameKillersServer,
};