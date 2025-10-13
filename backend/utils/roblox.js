// Game Killers Studio - Roblox Integration
// Complete Roblox API integration for verification and features

const axios = require('axios');
const { users, badges } = require('./datastore');

const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;
const ROBLOX_API_BASE = 'https://apis.roblox.com';
const ROBLOX_USERS_API = 'https://users.roblox.com';
const ROBLOX_GROUPS_API = 'https://groups.roblox.com';
const ROBLOX_BADGES_API = 'https://badges.roblox.com';

// Game Killers Roblox items for verification
const GAME_KILLERS_ITEMS = [
  { id: 11216008776, name: 'Game Killers Shirt 1' },
  { id: 11216011833, name: 'Game Killers Shirt 2' },
  { id: 10718030200, name: 'XXXTENTACION Remembrance Sale' },
  { id: 11244489505, name: 'Stan Smith' },
  { id: 11244499296, name: 'Stan Smith Suit pants' },
  { id: 11255247617, name: 'Pilgrim' },
  { id: 11255250959, name: 'Golden Pilgrim' },
  { id: 11255286659, name: 'Golden Pilgrim Pants' },
  { id: 11267241982, name: 'LFD TurnOut' },
  { id: 11267198788, name: 'RCEMS Paramedic' },
  { id: 11267193266, name: 'LPD Supervisors Uniform' },
  { id: 11267207454, name: 'RCEMS EMT' },
  { id: 11267203014, name: 'Rock County Deputy\'s Uniform' },
  { id: 11422054658, name: 'Remembrance of Robin Williams' },
];

// Get Roblox user by username
async function getRobloxUserByUsername(username) {
  try {
    const response = await axios.post(
      `${ROBLOX_USERS_API}/v1/usernames/users`,
      {
        usernames: [username],
        excludeBannedUsers: true,
      }
    );
    
    return response.data.data[0] || null;
  } catch (error) {
    console.error('Error fetching Roblox user:', error.response?.data || error.message);
    return null;
  }
}

// Get Roblox user by ID
async function getRobloxUserById(userId) {
  try {
    const response = await axios.get(
      `${ROBLOX_USERS_API}/v1/users/${userId}`
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching Roblox user by ID:', error.response?.data || error.message);
    return null;
  }
}

// Check if user owns Game Killers items
async function checkGameKillersItems(robloxUserId) {
  try {
    const ownedItems = [];
    
    for (const item of GAME_KILLERS_ITEMS) {
      const response = await axios.get(
        `https://inventory.roblox.com/v1/users/${robloxUserId}/items/Asset/${item.id}/is-owned`
      );
      
      if (response.data) {
        ownedItems.push(item);
      }
    }
    
    return ownedItems;
  } catch (error) {
    console.error('Error checking owned items:', error);
    return [];
  }
}

// Verify Roblox account has verified badge
async function hasRobloxVerifiedBadge(robloxUserId) {
  try {
    const user = await getRobloxUserById(robloxUserId);
    return user?.hasVerifiedBadge || false;
  } catch (error) {
    console.error('Error checking verified badge:', error);
    return false;
  }
}

// Get user's Roblox groups
async function getUserGroups(robloxUserId) {
  try {
    const response = await axios.get(
      `${ROBLOX_GROUPS_API}/v1/users/${robloxUserId}/groups/roles`
    );
    
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return [];
  }
}

// Link Roblox account to user
async function linkRobloxAccount(userId, robloxUsername) {
  try {
    const robloxUser = await getRobloxUserByUsername(robloxUsername);
    if (!robloxUser) throw new Error('Roblox user not found');

    const user = await users.getById(userId);
    if (!user) throw new Error('User not found');

    // Update user with Roblox info
    await users.update(userId, {
      robloxId: robloxUser.id,
      robloxUsername: robloxUser.name,
      robloxLinked: true,
      robloxLinkedAt: new Date().toISOString(),
    });

    // Check for verified badge
    const hasVerified = await hasRobloxVerifiedBadge(robloxUser.id);
    if (hasVerified) {
      await grantOrgBadge(userId, 'Roblox Verified');
    }

    // Check for Game Killers items (Founding Group Member)
    const ownedItems = await checkGameKillersItems(robloxUser.id);
    if (ownedItems.length > 0) {
      await grantFoundingGroupBadge(userId);
    }

    return {
      success: true,
      robloxUser,
      hasVerified,
      ownedItems,
    };
  } catch (error) {
    console.error('Error linking Roblox account:', error);
    throw error;
  }
}

// Grant Org Badge
async function grantOrgBadge(userId, source) {
  try {
    const existingBadge = await badges.findOne({ 
      userId, 
      type: 'ORG_VERIFIED' 
    });
    
    if (existingBadge) return existingBadge;

    return await badges.create({
      userId,
      type: 'ORG_VERIFIED',
      name: 'Org Verified',
      description: `Verified through ${source}`,
      icon: '✓',
      source,
    });
  } catch (error) {
    console.error('Error granting org badge:', error);
    return null;
  }
}

// Grant Founding Group Member Badge
async function grantFoundingGroupBadge(userId) {
  try {
    const existingBadge = await badges.findOne({ 
      userId, 
      type: 'FOUNDING_GROUP' 
    });
    
    if (existingBadge) return existingBadge;

    return await badges.create({
      userId,
      type: 'FOUNDING_GROUP',
      name: 'Founding Group Member',
      description: 'Member of the Game Killers founding group',
      icon: '🎮',
    });
  } catch (error) {
    console.error('Error granting founding group badge:', error);
    return null;
  }
}

// Fetch latest Roblox news from official sources
async function fetchRobloxNews() {
  try {
    const sources = [
      'https://blog.roblox.com',
      'https://devforum.roblox.com',
      'https://create.roblox.com',
    ];
    
    // This would normally scrape or use RSS feeds
    // For now, return placeholder structure
    return {
      articles: [],
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching Roblox news:', error);
    return { articles: [], lastUpdated: null };
  }
}

module.exports = {
  GAME_KILLERS_ITEMS,
  getRobloxUserByUsername,
  getRobloxUserById,
  checkGameKillersItems,
  hasRobloxVerifiedBadge,
  getUserGroups,
  linkRobloxAccount,
  grantOrgBadge,
  grantFoundingGroupBadge,
  fetchRobloxNews,
};