// Game Killers Studio - Movie Night Worker
// Handles Movie Night session cleanup and notifications

const cron = require('node-cron');
const { movieNights, users } = require('./datastore');
const { createNotification, sendBulkNotification } = require('./notifications');

// Start Movie Night worker
function startMovieNightWorker() {
  console.log('Starting Movie Night Worker...');

  // Cleanup old sessions - Every 2 hours
  cron.schedule('0 */2 * * *', async () => {
    console.log('Running Movie Night cleanup...');
    await cleanupOldSessions();
  });

  // Send reminders for upcoming sessions - Every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    await sendUpcomingReminders();
  });

  console.log('Movie Night Worker started successfully');
}

// Cleanup old Movie Night sessions
async function cleanupOldSessions() {
  try {
    const allSessions = await movieNights.getAll();
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let cleanedCount = 0;

    for (const session of allSessions) {
      const sessionDate = new Date(session.scheduledTime || session.createdAt);
      
      // Remove sessions older than 24 hours that are completed
      if (sessionDate < twentyFourHoursAgo && session.status === 'COMPLETED') {
        await movieNights.delete(session.id);
        cleanedCount++;
      }

      // Cancel sessions that never started and are 2 hours past scheduled time
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      if (sessionDate < twoHoursAgo && session.status === 'SCHEDULED') {
        await movieNights.update(session.id, {
          status: 'CANCELLED',
          cancelReason: 'Auto-cancelled - session not started',
        });
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} Movie Night sessions`);
    }
  } catch (error) {
    console.error('Error cleaning up Movie Night sessions:', error);
  }
}

// Send reminders for upcoming Movie Night sessions
async function sendUpcomingReminders() {
  try {
    const allSessions = await movieNights.find({ status: 'SCHEDULED' });
    const now = new Date();
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);
    const sixtyMinutesFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    for (const session of allSessions) {
      if (!session.scheduledTime) continue;

      const sessionTime = new Date(session.scheduledTime);

      // Send 15-minute reminder
      if (sessionTime <= fifteenMinutesFromNow && sessionTime > now && !session.reminder15Sent) {
        await sendSessionReminder(session, '15 minutes');
        await movieNights.update(session.id, { reminder15Sent: true });
      }

      // Send 1-hour reminder
      if (sessionTime <= sixtyMinutesFromNow && sessionTime > fifteenMinutesFromNow && !session.reminder60Sent) {
        await sendSessionReminder(session, '1 hour');
        await movieNights.update(session.id, { reminder60Sent: true });
      }
    }
  } catch (error) {
    console.error('Error sending Movie Night reminders:', error);
  }
}

// Send reminder to session participants
async function sendSessionReminder(session, timeframe) {
  try {
    const participants = session.participants || [];
    
    if (participants.length === 0) return;

    await sendBulkNotification(participants, {
      type: 'MOVIE_NIGHT_START',
      title: 'Movie Night Starting Soon!',
      message: `"${session.title}" starts in ${timeframe}!`,
      link: `/movies/${session.id}`,
      data: {
        sessionId: session.id,
        title: session.title,
        scheduledTime: session.scheduledTime,
      },
    });

    console.log(`Sent ${timeframe} reminder for Movie Night: ${session.title}`);
  } catch (error) {
    console.error('Error sending session reminder:', error);
  }
}

// Create a new Movie Night session
async function createMovieNightSession(hostId, sessionData) {
  try {
    const host = await users.getById(hostId);
    if (!host) throw new Error('Host not found');

    const session = await movieNights.create({
      hostId,
      hostName: host.username,
      title: sessionData.title,
      description: sessionData.description,
      movieUrl: sessionData.movieUrl,
      scheduledTime: sessionData.scheduledTime,
      maxParticipants: sessionData.maxParticipants || 50,
      requireSubscription: sessionData.requireSubscription || false,
      minTier: sessionData.minTier || null,
      isPublic: sessionData.isPublic !== false,
      participants: [hostId],
      chat: [],
      status: 'SCHEDULED',
      reminder15Sent: false,
      reminder60Sent: false,
    });

    return session;
  } catch (error) {
    console.error('Error creating Movie Night session:', error);
    throw error;
  }
}

// Join a Movie Night session
async function joinMovieNightSession(sessionId, userId) {
  try {
    const session = await movieNights.getById(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.status !== 'SCHEDULED' && session.status !== 'ACTIVE') {
      throw new Error('Cannot join this session');
    }

    if (session.participants.includes(userId)) {
      throw new Error('Already joined this session');
    }

    if (session.participants.length >= session.maxParticipants) {
      throw new Error('Session is full');
    }

    // Check subscription requirements
    if (session.requireSubscription && session.minTier) {
      const user = await users.getById(userId);
      const userTier = await getUserSubscriptionTier(userId);
      
      if (!userTier || getTierNumber(userTier) < getTierNumber(session.minTier)) {
        throw new Error('Subscription tier too low for this session');
      }
    }

    await movieNights.update(sessionId, {
      participants: [...session.participants, userId],
    });

    // Notify host
    await createNotification({
      userId: session.hostId,
      type: 'MOVIE_NIGHT_INVITE',
      title: 'New Participant',
      message: 'Someone joined your Movie Night!',
      link: `/movies/${sessionId}`,
    });

    return true;
  } catch (error) {
    console.error('Error joining Movie Night session:', error);
    throw error;
  }
}

// Leave a Movie Night session
async function leaveMovieNightSession(sessionId, userId) {
  try {
    const session = await movieNights.getById(sessionId);
    if (!session) throw new Error('Session not found');

    const participants = session.participants.filter(id => id !== userId);

    await movieNights.update(sessionId, { participants });

    return true;
  } catch (error) {
    console.error('Error leaving Movie Night session:', error);
    throw error;
  }
}

// Start a Movie Night session
async function startMovieNightSession(sessionId, hostId) {
  try {
    const session = await movieNights.getById(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.hostId !== hostId) {
      throw new Error('Only the host can start the session');
    }

    await movieNights.update(sessionId, {
      status: 'ACTIVE',
      startedAt: new Date().toISOString(),
    });

    // Notify all participants
    await sendBulkNotification(session.participants, {
      type: 'MOVIE_NIGHT_START',
      title: 'Movie Night Started!',
      message: `"${session.title}" has started!`,
      link: `/movies/${sessionId}`,
    });

    return true;
  } catch (error) {
    console.error('Error starting Movie Night session:', error);
    throw error;
  }
}

// End a Movie Night session
async function endMovieNightSession(sessionId, hostId) {
  try {
    const session = await movieNights.getById(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.hostId !== hostId) {
      throw new Error('Only the host can end the session');
    }

    await movieNights.update(sessionId, {
      status: 'COMPLETED',
      endedAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error ending Movie Night session:', error);
    throw error;
  }
}

// Add chat message to session
async function addChatMessage(sessionId, userId, message) {
  try {
    const session = await movieNights.getById(sessionId);
    if (!session) throw new Error('Session not found');

    if (!session.participants.includes(userId)) {
      throw new Error('Must be a participant to chat');
    }

    const user = await users.getById(userId);
    
    const chatMessage = {
      id: require('uuid').v4(),
      userId,
      username: user.username,
      avatar: user.avatar,
      message,
      timestamp: new Date().toISOString(),
    };

    await movieNights.update(sessionId, {
      chat: [...(session.chat || []), chatMessage],
    });

    return chatMessage;
  } catch (error) {
    console.error('Error adding chat message:', error);
    throw error;
  }
}

// Helper function to get tier number
function getTierNumber(tier) {
  return parseInt(tier.replace('tier', ''));
}

module.exports = {
  startMovieNightWorker,
  cleanupOldSessions,
  sendUpcomingReminders,
  createMovieNightSession,
  joinMovieNightSession,
  leaveMovieNightSession,
  startMovieNightSession,
  endMovieNightSession,
  addChatMessage,
};