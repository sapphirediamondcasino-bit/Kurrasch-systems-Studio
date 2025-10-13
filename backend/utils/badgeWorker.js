// Game Killers Studio - Badge Worker
// Handles automatic badge verification and assignment

const cron = require('node-cron');
const axios = require('axios');
const { users, badges } = require('./datastore');
const { createNotification } = require('./notifications');
const { hasRobloxVerifiedBadge } = require('./roblox');

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',');

// Badge types
const BADGE_TYPES = {
  FOUNDER: 'FOUNDER',
  ORG_VERIFIED: 'ORG_VERIFIED',
  FOUNDING_GROUP: 'FOUNDING_GROUP',
  CUSTOM_CREATOR: 'CUSTOM_CREATOR',
  LEVEL_MILESTONE: 'LEVEL_MILESTONE',
  ACHIEVEMENT: 'ACHIEVEMENT',
};

// Start badge worker
function startBadgeWorker() {
  console.log('Starting Badge Worker...');

  // Badge verification - Every 12 hours
  cron.schedule('0 */12 * * *', async () => {
    console.log('Running badge verification...');
    await verifyAllBadges();
  });

  console.log('Badge Worker started successfully');
}

// Verify all badges for all users
async function verifyAllBadges() {
  try {
    const allUsers = await users.getAll();

    for (const user of allUsers) {
      await verifyUserBadges(user.id);
    }

    console.log('Badge verification completed');
  } catch (error) {
    console.error('Error in badge verification:', error);
  }
}

// Verify badges for a specific user
async function verifyUserBadges(userId) {
  try {
    const user = await users.getById(userId);
    if (!user) return;

    // Check Founder Badge
    await checkFounderBadge(user);

    // Check Org Verified Badge
    await checkOrgVerifiedBadge(user);

    // Check Founding Group Badge
    await checkFoundingGroupBadge(user);

    // Check Level Milestone Badges
    await checkLevelMilestoneBadges(user);
  } catch (error) {
    console.error(`Error verifying badges for user ${userId}:`, error);
  }
}

// Check and grant Founder Badge
async function checkFounderBadge(user) {
  try {
    if (!ADMIN_EMAILS.includes(user.email)) return;

    const existingBadge = await badges.findOne({
      userId: user.id,
      type: BADGE_TYPES.FOUNDER,
    });

    if (existingBadge) return;

    const badge = await badges.create({
      userId: user.id,
      type: BADGE_TYPES.FOUNDER,
      name: 'Founder',
      description: 'Founding member of Game Killers Studio',
      icon: '👑',
      color: '#FFD700',
    });

    await createNotification({
      userId: user.id,
      type: 'BADGE',
      title: 'Founder Badge Awarded!',
      message: 'You\'ve been awarded the Founder badge!',
      data: { badgeId: badge.id },
    });

    console.log(`Granted Founder badge to ${user.email}`);
  } catch (error) {
    console.error('Error checking Founder badge:', error);
  }
}

// Check and grant Org Verified Badge
async function checkOrgVerifiedBadge(user) {
  try {
    const existingBadge = await badges.findOne({
      userId: user.id,
      type: BADGE_TYPES.ORG_VERIFIED,
    });

    if (existingBadge) return;

    let verified = false;
    let source = '';

    // Check Roblox verification
    if (user.robloxId) {
      const hasRobloxBadge = await hasRobloxVerifiedBadge(user.robloxId);
      if (hasRobloxBadge) {
        verified = true;
        source = 'Roblox Verified';
      }
    }

    // Check Twitch followers
    if (!verified && user.twitchUsername) {
      const twitchFollowers = await getTwitchFollowers(user.twitchUsername);
      if (twitchFollowers >= 2000) {
        verified = true;
        source = `Twitch ${twitchFollowers} followers`;
      }
    }

    // Check TikTok followers
    if (!verified && user.tiktokUsername) {
      const tiktokFollowers = await getTikTokFollowers(user.tiktokUsername);
      if (tiktokFollowers >= 3000) {
        verified = true;
        source = `TikTok ${tiktokFollowers} followers`;
      }
    }

    if (verified) {
      const badge = await badges.create({
        userId: user.id,
        type: BADGE_TYPES.ORG_VERIFIED,
        name: 'Org Verified',
        description: `Verified ${source}`,
        icon: '✓',
        color: '#1DA1F2',
      });

      await createNotification({
        userId: user.id,
        type: 'BADGE',
        title: 'Org Verified Badge Awarded!',
        message: `You've been verified through ${source}!`,
        data: { badgeId: badge.id },
      });

      console.log(`Granted Org Verified badge to user ${user.id} via ${source}`);
    }
  } catch (error) {
    console.error('Error checking Org Verified badge:', error);
  }
}

// Check and grant Founding Group Badge
async function checkFoundingGroupBadge(user) {
  try {
    if (!user.robloxId) return;

    const existingBadge = await badges.findOne({
      userId: user.id,
      type: BADGE_TYPES.FOUNDING_GROUP,
    });

    if (existingBadge) return;

    // This would normally check for Game Killers items ownership
    // Already handled in roblox.js linkRobloxAccount function
  } catch (error) {
    console.error('Error checking Founding Group badge:', error);
  }
}

// Check and grant Level Milestone Badges
async function checkLevelMilestoneBadges(user) {
  try {
    const level = user.level || 1;
    const milestones = [10, 25, 50, 100, 250, 500, 1000];

    for (const milestone of milestones) {
      if (level >= milestone) {
        const existingBadge = await badges.findOne({
          userId: user.id,
          type: BADGE_TYPES.LEVEL_MILESTONE,
          name: `Level ${milestone}`,
        });

        if (!existingBadge) {
          await badges.create({
            userId: user.id,
            type: BADGE_TYPES.LEVEL_MILESTONE,
            name: `Level ${milestone}`,
            description: `Reached level ${milestone}`,
            icon: '⭐',
            color: '#FFA500',
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking level milestone badges:', error);
  }
}

// Get Twitch followers count (placeholder)
async function getTwitchFollowers(username) {
  try {
    // This would integrate with Twitch API
    // Placeholder for now
    return 0;
  } catch (error) {
    console.error('Error fetching Twitch followers:', error);
    return 0;
  }
}

// Get TikTok followers count (placeholder)
async function getTikTokFollowers(username) {
  try {
    // This would integrate with TikTok API
    // Placeholder for now
    return 0;
  } catch (error) {
    console.error('Error fetching TikTok followers:', error);
    return 0;
  }
}

// Manually grant badge to user
async function grantBadge(userId, badgeData) {
  try {
    const badge = await badges.create({
      userId,
      ...badgeData,
    });

    await createNotification({
      userId,
      type: 'BADGE',
      title: 'New Badge Awarded!',
      message: `You've been awarded the ${badgeData.name} badge!`,
      data: { badgeId: badge.id },
    });

    return badge;
  } catch (error) {
    console.error('Error granting badge:', error);
    return null;
  }
}

// Get all badges for a user
async function getUserBadges(userId) {
  try {
    return await badges.find({ userId });
  } catch (error) {
    console.error('Error getting user badges:', error);
    return [];
  }
}

module.exports = {
  BADGE_TYPES,
  startBadgeWorker,
  verifyAllBadges,
  verifyUserBadges,
  checkFounderBadge,
  checkOrgVerifiedBadge,
  checkFoundingGroupBadge,
  grantBadge,
  getUserBadges,
};