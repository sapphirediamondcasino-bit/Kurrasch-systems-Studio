// Game Killers Studio - Subscription Worker
// Handles subscription renewals, credit allocation, and expiration

const cron = require('node-cron');
const { subscriptions, users } = require('./datastore');
const { createNotification } = require('./notifications');
const { SUBSCRIPTION_PLANS } = require('./paypal');

// Start subscription worker
function startSubscriptionWorker() {
  console.log('Starting Subscription Worker...');

  // Daily check at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily subscription checks...');
    await checkSubscriptions();
    await allocateMonthlyCredits();
  });

  // Weekly expiration warnings (Sundays at 10 AM)
  cron.schedule('0 10 * * 0', async () => {
    console.log('Sending subscription expiration warnings...');
    await sendExpirationWarnings();
  });

  console.log('Subscription Worker started successfully');
}

// Check all subscriptions for renewals and expirations
async function checkSubscriptions() {
  try {
    const allSubscriptions = await subscriptions.getAll();
    const now = new Date();

    for (const subscription of allSubscriptions) {
      if (subscription.status !== 'ACTIVE') continue;

      const nextBilling = new Date(subscription.nextBillingDate);
      
      // Check if subscription should renew
      if (nextBilling <= now) {
        await renewSubscription(subscription);
      }
    }

    console.log('Subscription check completed');
  } catch (error) {
    console.error('Error checking subscriptions:', error);
  }
}

// Renew a subscription
async function renewSubscription(subscription) {
  try {
    const plan = SUBSCRIPTION_PLANS[subscription.tier];
    if (!plan) {
      console.error(`Invalid tier for subscription ${subscription.id}`);
      return;
    }

    // Calculate next billing date (30 days from now)
    const nextBillingDate = new Date();
    nextBillingDate.setDate(nextBillingDate.getDate() + 30);

    // Update subscription
    await subscriptions.update(subscription.id, {
      nextBillingDate: nextBillingDate.toISOString(),
      lastRenewalDate: new Date().toISOString(),
    });

    // Allocate credits for the new period
    await allocateCreditsForSubscription(subscription.userId, plan);

    // Notify user
    await createNotification({
      userId: subscription.userId,
      type: 'SUBSCRIPTION',
      title: 'Subscription Renewed',
      message: `Your ${plan.name} subscription has been renewed!`,
      data: {
        tier: subscription.tier,
        nextBillingDate: nextBillingDate.toISOString(),
      },
    });

    console.log(`Renewed subscription ${subscription.id} for user ${subscription.userId}`);
  } catch (error) {
    console.error(`Error renewing subscription ${subscription.id}:`, error);
  }
}

// Allocate monthly credits to all active subscribers
async function allocateMonthlyCredits() {
  try {
    const activeSubscriptions = await subscriptions.find({ status: 'ACTIVE' });
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Only run on the first day of the month
    if (now.getDate() !== 1) return;

    for (const subscription of activeSubscriptions) {
      const plan = SUBSCRIPTION_PLANS[subscription.tier];
      if (!plan) continue;

      await allocateCreditsForSubscription(subscription.userId, plan);
    }

    console.log(`Allocated monthly credits to ${activeSubscriptions.length} subscribers`);
  } catch (error) {
    console.error('Error allocating monthly credits:', error);
  }
}

// Allocate credits for a specific subscription
async function allocateCreditsForSubscription(userId, plan) {
  try {
    const user = await users.getById(userId);
    if (!user) return;

    // Tier 5 gets unlimited credits (represented as -1)
    if (plan.adCredits === -1) {
      await users.update(userId, {
        adCredits: -1,
        aiCredits: -1,
      });
    } else {
      await users.update(userId, {
        adCredits: (user.adCredits || 0) + plan.adCredits,
        aiCredits: (user.aiCredits || 0) + plan.aiCredits,
      });
    }

    console.log(`Allocated credits to user ${userId}: ${plan.adCredits} ad, ${plan.aiCredits} ai`);
  } catch (error) {
    console.error(`Error allocating credits for user ${userId}:`, error);
  }
}

// Send expiration warnings (7 days before expiration)
async function sendExpirationWarnings() {
  try {
    const allSubscriptions = await subscriptions.find({ status: 'ACTIVE' });
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    for (const subscription of allSubscriptions) {
      const nextBilling = new Date(subscription.nextBillingDate);
      
      // Check if renewal is within 7 days
      if (nextBilling <= sevenDaysFromNow && nextBilling > new Date()) {
        await createNotification({
          userId: subscription.userId,
          type: 'SUBSCRIPTION',
          title: 'Subscription Renewal Reminder',
          message: 'Your subscription will renew in 7 days.',
          data: {
            tier: subscription.tier,
            nextBillingDate: subscription.nextBillingDate,
          },
        });
      }
    }

    console.log('Expiration warnings sent');
  } catch (error) {
    console.error('Error sending expiration warnings:', error);
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancellation(subscriptionId) {
  try {
    const subscription = await subscriptions.getById(subscriptionId);
    if (!subscription) return;

    await subscriptions.update(subscriptionId, {
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString(),
    });

    await createNotification({
      userId: subscription.userId,
      type: 'SUBSCRIPTION',
      title: 'Subscription Cancelled',
      message: 'Your subscription has been cancelled. You will retain access until the end of your current billing period.',
      data: {
        tier: subscription.tier,
        expiresAt: subscription.nextBillingDate,
      },
    });

    console.log(`Cancelled subscription ${subscriptionId}`);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

// Check if user has active subscription
async function hasActiveSubscription(userId) {
  try {
    const userSubscription = await subscriptions.findOne({ 
      userId, 
      status: 'ACTIVE' 
    });
    return !!userSubscription;
  } catch (error) {
    console.error('Error checking active subscription:', error);
    return false;
  }
}

// Get user's subscription tier
async function getUserSubscriptionTier(userId) {
  try {
    const userSubscription = await subscriptions.findOne({ 
      userId, 
      status: 'ACTIVE' 
    });
    return userSubscription?.tier || null;
  } catch (error) {
    console.error('Error getting subscription tier:', error);
    return null;
  }
}

module.exports = {
  startSubscriptionWorker,
  checkSubscriptions,
  renewSubscription,
  allocateMonthlyCredits,
  allocateCreditsForSubscription,
  sendExpirationWarnings,
  handleSubscriptionCancellation,
  hasActiveSubscription,
  getUserSubscriptionTier,
};