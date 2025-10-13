// Game Killers Studio - PayPal Integration
// Complete subscription and credit purchase system

const axios = require('axios');
const { subscriptions, users } = require('./datastore');

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const PAYPAL_API_BASE = PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

// Subscription plans with Game Killers Studio branding
const SUBSCRIPTION_PLANS = {
  tier1: {
    name: 'Game Killers Studio Tier 1',
    price: 4.99,
    adCredits: 50,
    aiCredits: 100,
    features: ['Basic Access', '50 Ad Credits/month', '100 AI Credits/month'],
  },
  tier2: {
    name: 'Game Killers Studio Tier 2',
    price: 9.99,
    adCredits: 150,
    aiCredits: 300,
    features: ['Enhanced Access', '150 Ad Credits/month', '300 AI Credits/month'],
  },
  tier3: {
    name: 'Game Killers Studio Tier 3',
    price: 19.99,
    adCredits: 400,
    aiCredits: 750,
    features: ['Pro Access', '400 Ad Credits/month', '750 AI Credits/month'],
  },
  tier4: {
    name: 'Game Killers Studio Tier 4',
    price: 49.99,
    adCredits: 1200,
    aiCredits: 2000,
    features: ['Premium Access', '1200 Ad Credits/month', '2000 AI Credits/month'],
  },
  tier5: {
    name: 'Game Killers Studio Tier 5',
    price: 99.99,
    adCredits: -1, // Unlimited
    aiCredits: -1, // Unlimited
    features: ['Ultimate Access', 'Unlimited Ad Credits', 'Unlimited AI Credits', 'Priority Support'],
  },
};

// Credit purchase options
const CREDIT_PACKAGES = {
  small: { adCredits: 50, aiCredits: 100, price: 4.99 },
  medium: { adCredits: 150, aiCredits: 300, price: 9.99 },
  large: { adCredits: 400, aiCredits: 750, price: 19.99 },
  xlarge: { adCredits: 1200, aiCredits: 2000, price: 49.99 },
  mega: { adCredits: 3000, aiCredits: 5000, price: 99.99 },
};

// Get PayPal access token
async function getAccessToken() {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with PayPal');
  }
}

// Create subscription
async function createSubscription(userId, tier) {
  try {
    const plan = SUBSCRIPTION_PLANS[tier];
    if (!plan) throw new Error('Invalid subscription tier');

    const token = await getAccessToken();
    
    // Create subscription in PayPal
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions`,
      {
        plan_id: process.env[`PAYPAL_PLAN_${tier.toUpperCase()}_ID`],
        subscriber: {
          email_address: (await users.getById(userId))?.email,
        },
        application_context: {
          return_url: `${process.env.PRODUCTION_URL || 'http://localhost:25808'}/api/subscriptions/success`,
          cancel_url: `${process.env.PRODUCTION_URL || 'http://localhost:25808'}/api/subscriptions/cancel`,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    // Save subscription to database
    const subscription = await subscriptions.create({
      userId,
      tier,
      paypalSubscriptionId: response.data.id,
      status: 'PENDING',
      adCredits: plan.adCredits,
      aiCredits: plan.aiCredits,
      price: plan.price,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    
    return {
      subscriptionId: subscription.id,
      approvalUrl: response.data.links.find(link => link.rel === 'approve')?.href,
    };
  } catch (error) {
    console.error('Error creating subscription:', error.response?.data || error.message);
    throw new Error('Failed to create subscription');
  }
}

// Cancel subscription
async function cancelSubscription(userId) {
  try {
    const userSubscription = await subscriptions.findOne({ userId, status: 'ACTIVE' });
    if (!userSubscription) throw new Error('No active subscription found');

    const token = await getAccessToken();
    
    await axios.post(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions/${userSubscription.paypalSubscriptionId}/cancel`,
      { reason: 'User requested cancellation' },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    await subscriptions.update(userSubscription.id, {
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString(),
    });
    
    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error.response?.data || error.message);
    throw new Error('Failed to cancel subscription');
  }
}

// Purchase credits (one-time payment)
async function purchaseCredits(userId, packageType) {
  try {
    const creditPackage = CREDIT_PACKAGES[packageType];
    if (!creditPackage) throw new Error('Invalid credit package');

    const token = await getAccessToken();
    
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: creditPackage.price.toFixed(2),
          },
          description: `Game Killers Studio Credits - ${packageType}`,
        }],
        application_context: {
          return_url: `${process.env.PRODUCTION_URL || 'http://localhost:25808'}/api/subscriptions/credits/success`,
          cancel_url: `${process.env.PRODUCTION_URL || 'http://localhost:25808'}/api/subscriptions/credits/cancel`,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      orderId: response.data.id,
      approvalUrl: response.data.links.find(link => link.rel === 'approve')?.href,
      credits: creditPackage,
    };
  } catch (error) {
    console.error('Error purchasing credits:', error.response?.data || error.message);
    throw new Error('Failed to purchase credits');
  }
}

// Add credits to user after successful payment
async function addCreditsToUser(userId, adCredits, aiCredits) {
  try {
    const user = await users.getById(userId);
    if (!user) throw new Error('User not found');

    await users.update(userId, {
      adCredits: (user.adCredits || 0) + adCredits,
      aiCredits: (user.aiCredits || 0) + aiCredits,
    });
    
    return true;
  } catch (error) {
    console.error('Error adding credits:', error);
    return false;
  }
}

// Verify webhook signature
function verifyWebhookSignature(headers, body) {
  // PayPal webhook verification logic
  // This is a placeholder - implement proper verification in production
  return true;
}

module.exports = {
  SUBSCRIPTION_PLANS,
  CREDIT_PACKAGES,
  getAccessToken,
  createSubscription,
  cancelSubscription,
  purchaseCredits,
  addCreditsToUser,
  verifyWebhookSignature,
};