// Game Killers Studio - Notification System
// Complete notification management for all platform activities

const { notifications } = require('./datastore');

// Notification types
const NOTIFICATION_TYPES = {
  LIKE: 'LIKE',
  COMMENT: 'COMMENT',
  FOLLOW: 'FOLLOW',
  FRIEND_REQUEST: 'FRIEND_REQUEST',
  FRIEND_ACCEPT: 'FRIEND_ACCEPT',
  MENTION: 'MENTION',
  LEVEL_UP: 'LEVEL_UP',
  BADGE: 'BADGE',
  SUBSCRIPTION: 'SUBSCRIPTION',
  GAME_APPROVED: 'GAME_APPROVED',
  GAME_REJECTED: 'GAME_REJECTED',
  MOVIE_NIGHT_INVITE: 'MOVIE_NIGHT_INVITE',
  MOVIE_NIGHT_START: 'MOVIE_NIGHT_START',
  BUILD_BATTLE_INVITE: 'BUILD_BATTLE_INVITE',
  BUILD_BATTLE_RESULT: 'BUILD_BATTLE_RESULT',
  TEAM_INVITE: 'TEAM_INVITE',
  PROJECT_UPDATE: 'PROJECT_UPDATE',
  GOAL_REMINDER: 'GOAL_REMINDER',
  MARKETPLACE_SALE: 'MARKETPLACE_SALE',
  AI_MESSAGE: 'AI_MESSAGE',
  ADMIN_MESSAGE: 'ADMIN_MESSAGE',
  SYSTEM: 'SYSTEM',
  REWARD: 'REWARD',
};

// Create notification
async function createNotification(data) {
  try {
    const notification = await notifications.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || {},
      fromUserId: data.fromUserId || null,
      link: data.link || null,
      read: false,
      priority: data.priority || 'normal',
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

// Get user notifications
async function getUserNotifications(userId, options = {}) {
  try {
    const { limit = 50, unreadOnly = false } = options;
    
    let userNotifications = await notifications.find({ userId });
    
    if (unreadOnly) {
      userNotifications = userNotifications.filter(n => !n.read);
    }
    
    // Sort by created date (newest first)
    userNotifications.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    return userNotifications.slice(0, limit);
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

// Mark notification as read
async function markAsRead(notificationId) {
  try {
    return await notifications.update(notificationId, { read: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
}

// Mark all notifications as read for user
async function markAllAsRead(userId) {
  try {
    const userNotifications = await notifications.find({ userId, read: false });
    
    await Promise.all(
      userNotifications.map(n => notifications.update(n.id, { read: true }))
    );
    
    return true;
  } catch (error) {
    console.error('Error marking all as read:', error);
    return false;
  }
}

// Delete notification
async function deleteNotification(notificationId) {
  try {
    return await notifications.delete(notificationId);
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}

// Get unread count
async function getUnreadCount(userId) {
  try {
    const userNotifications = await notifications.find({ userId, read: false });
    return userNotifications.length;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

// Send notification to multiple users
async function sendBulkNotification(userIds, data) {
  try {
    const results = await Promise.all(
      userIds.map(userId => createNotification({ ...data, userId }))
    );
    return results.filter(r => r !== null);
  } catch (error) {
    console.error('Error sending bulk notification:', error);
    return [];
  }
}

// Clean old notifications (older than 30 days)
async function cleanOldNotifications() {
  try {
    const allNotifications = await notifications.getAll();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldNotifications = allNotifications.filter(n => 
      new Date(n.createdAt) < thirtyDaysAgo && n.read
    );
    
    await Promise.all(
      oldNotifications.map(n => notifications.delete(n.id))
    );
    
    console.log(`Cleaned ${oldNotifications.length} old notifications`);
    return oldNotifications.length;
  } catch (error) {
    console.error('Error cleaning old notifications:', error);
    return 0;
  }
}

// Helper functions for specific notification types
async function notifyPostLike(postOwnerId, likerUserId, postId) {
  return await createNotification({
    userId: postOwnerId,
    type: NOTIFICATION_TYPES.LIKE,
    title: 'New Like',
    message: 'Someone liked your post!',
    fromUserId: likerUserId,
    link: `/post/${postId}`,
  });
}

async function notifyPostComment(postOwnerId, commenterUserId, postId) {
  return await createNotification({
    userId: postOwnerId,
    type: NOTIFICATION_TYPES.COMMENT,
    title: 'New Comment',
    message: 'Someone commented on your post!',
    fromUserId: commenterUserId,
    link: `/post/${postId}`,
  });
}

async function notifyFriendRequest(recipientId, requesterId) {
  return await createNotification({
    userId: recipientId,
    type: NOTIFICATION_TYPES.FRIEND_REQUEST,
    title: 'Friend Request',
    message: 'You have a new friend request!',
    fromUserId: requesterId,
    link: `/profile/${requesterId}`,
  });
}

async function notifyFriendAccept(requesterId, accepterId) {
  return await createNotification({
    userId: requesterId,
    type: NOTIFICATION_TYPES.FRIEND_ACCEPT,
    title: 'Friend Request Accepted',
    message: 'Your friend request was accepted!',
    fromUserId: accepterId,
    link: `/profile/${accepterId}`,
  });
}

async function notifyFollow(followedUserId, followerId) {
  return await createNotification({
    userId: followedUserId,
    type: NOTIFICATION_TYPES.FOLLOW,
    title: 'New Follower',
    message: 'Someone started following you!',
    fromUserId: followerId,
    link: `/profile/${followerId}`,
  });
}

module.exports = {
  NOTIFICATION_TYPES,
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  sendBulkNotification,
  cleanOldNotifications,
  notifyPostLike,
  notifyPostComment,
  notifyFriendRequest,
  notifyFriendAccept,
  notifyFollow,
};