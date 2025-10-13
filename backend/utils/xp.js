// Game Killers Studio - XP & Leveling System
// Complete experience point calculation and rewards

const { users, xpLeaderboard, notifications } = require('./datastore');
const { createNotification } = require('./notifications');

// XP values for different actions
const XP_VALUES = {
  POST_CREATE: 10,
  POST_LIKE: 2,
  POST_COMMENT: 5,
  GAME_UPLOAD: 50,
  GAME_PLAY: 3,
  FRIEND_ADD: 5,
  PROFILE_COMPLETE: 25,
  DAILY_LOGIN: 5,
  MOVIE_NIGHT_HOST: 20,
  MOVIE_NIGHT_JOIN: 10,
  BUILD_BATTLE_PARTICIPATE: 30,
  BUILD_BATTLE_WIN: 100,
  TEAM_BUILDER_CREATE: 15,
  IDEA_VAULT_SUBMIT: 10,
  PROJECT_HUB_CREATE: 25,
  GOAL_COMPLETE: 50,
  MINI_ARCADE_HIGHSCORE: 20,
  MARKETPLACE_SALE: 15,
  AI_CHAT: 1,
};

// Level thresholds (XP required for each level)
function calculateLevelThreshold(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Calculate level from XP
function calculateLevel(xp) {
  let level = 1;
  let totalXP = 0;
  
  while (totalXP <= xp) {
    totalXP += calculateLevelThreshold(level);
    if (totalXP > xp) break;
    level++;
  }
  
  return level;
}

// Calculate XP progress to next level
function calculateProgress(xp) {
  const currentLevel = calculateLevel(xp);
  const currentLevelXP = calculateLevelThreshold(currentLevel);
  const nextLevelXP = calculateLevelThreshold(currentLevel + 1);
  
  let xpInCurrentLevel = xp;
  for (let i = 1; i < currentLevel; i++) {
    xpInCurrentLevel -= calculateLevelThreshold(i);
  }
  
  const progress = (xpInCurrentLevel / currentLevelXP) * 100;
  
  return {
    currentLevel,
    xp,
    xpInCurrentLevel,
    xpToNextLevel: currentLevelXP - xpInCurrentLevel,
    totalXpForNextLevel: currentLevelXP,
    progress: Math.min(progress, 100),
  };
}

// Add XP to user
async function addXP(userId, action, amount = null) {
  try {
    const user = await users.getById(userId);
    if (!user) return null;

    const xpAmount = amount || XP_VALUES[action] || 0;
    const oldXP = user.xp || 0;
    const newXP = oldXP + xpAmount;
    
    const oldLevel = calculateLevel(oldXP);
    const newLevel = calculateLevel(newXP);
    
    // Update user XP
    await users.update(userId, { xp: newXP });
    
    // Update leaderboard
    await updateLeaderboard(userId, newXP);
    
    // Check for level up
    if (newLevel > oldLevel) {
      await handleLevelUp(userId, oldLevel, newLevel);
    }
    
    return {
      xpGained: xpAmount,
      totalXP: newXP,
      leveledUp: newLevel > oldLevel,
      oldLevel,
      newLevel,
      progress: calculateProgress(newXP),
    };
  } catch (error) {
    console.error('Error adding XP:', error);
    return null;
  }
}

// Handle level up rewards and notifications
async function handleLevelUp(userId, oldLevel, newLevel) {
  try {
    const user = await users.getById(userId);
    if (!user) return;

    // Send level up notification
    await createNotification({
      userId,
      type: 'LEVEL_UP',
      title: `Level Up! You're now level ${newLevel}`,
      message: `Congratulations! You've reached level ${newLevel}!`,
      data: { oldLevel, newLevel },
    });

    // Grant rewards based on level milestones
    if (newLevel % 10 === 0) {
      // Every 10 levels: bonus credits
      const bonusCredits = newLevel * 10;
      await users.update(userId, {
        adCredits: (user.adCredits || 0) + bonusCredits,
      });
      
      await createNotification({
        userId,
        type: 'REWARD',
        title: 'Milestone Reward!',
        message: `You've earned ${bonusCredits} bonus ad credits for reaching level ${newLevel}!`,
      });
    }

    if (newLevel % 25 === 0) {
      // Every 25 levels: special badge
      await createNotification({
        userId,
        type: 'BADGE',
        title: 'Special Badge Unlocked!',
        message: `You've earned a special badge for reaching level ${newLevel}!`,
      });
    }

    console.log(`User ${userId} leveled up: ${oldLevel} -> ${newLevel}`);
  } catch (error) {
    console.error('Error handling level up:', error);
  }
}

// Update leaderboard
async function updateLeaderboard(userId, xp) {
  try {
    const leaderboard = await xpLeaderboard.getAll();
    const existingEntry = leaderboard.find(entry => entry.userId === userId);
    
    if (existingEntry) {
      await xpLeaderboard.update(existingEntry.id, {
        xp,
        level: calculateLevel(xp),
        lastUpdated: new Date().toISOString(),
      });
    } else {
      await xpLeaderboard.create({
        userId,
        xp,
        level: calculateLevel(xp),
        lastUpdated: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
}

// Get user's XP stats
async function getUserXPStats(userId) {
  try {
    const user = await users.getById(userId);
    if (!user) return null;

    const xp = user.xp || 0;
    const progress = calculateProgress(xp);
    
    // Get leaderboard position
    const leaderboard = await xpLeaderboard.getAll();
    const sortedLeaderboard = leaderboard.sort((a, b) => b.xp - a.xp);
    const position = sortedLeaderboard.findIndex(entry => entry.userId === userId) + 1;
    
    return {
      ...progress,
      position,
      totalUsers: leaderboard.length,
    };
  } catch (error) {
    console.error('Error getting XP stats:', error);
    return null;
  }
}

// Get top users on leaderboard
async function getTopUsers(limit = 100) {
  try {
    const leaderboard = await xpLeaderboard.getAll();
    const sorted = leaderboard.sort((a, b) => b.xp - a.xp);
    const top = sorted.slice(0, limit);
    
    // Fetch user details
    const topWithDetails = await Promise.all(
      top.map(async (entry) => {
        const user = await users.getById(entry.userId);
        return {
          ...entry,
          username: user?.username,
          displayName: user?.displayName,
          avatar: user?.avatar,
        };
      })
    );
    
    return topWithDetails;
  } catch (error) {
    console.error('Error getting top users:', error);
    return [];
  }
}

module.exports = {
  XP_VALUES,
  calculateLevel,
  calculateProgress,
  addXP,
  getUserXPStats,
  getTopUsers,
  updateLeaderboard,
};