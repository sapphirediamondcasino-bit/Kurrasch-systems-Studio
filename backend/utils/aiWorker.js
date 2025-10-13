// Game Killers Studio - AI Background Worker
// Handles AI learning, auto-posting, and content generation

const cron = require('node-cron');
const axios = require('axios');
const { aiLogs, posts, users } = require('./datastore');
const { fetchRobloxNews } = require('./roblox');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AI_ENABLED = process.env.AI_ENABLED === 'true';

// AI Avatar user IDs (will be created on init)
const AI_AVATARS = {
  bettywhite: null,
  robinwilliams: null,
  johnnyhardwick: null,
  jonathanjoss: null,
  dianekeaton: null,
  shelleyduvall: null,
  michelletrachtenberg: null,
  jamesearlJones: null,
  matthewperry: null,
  johncandy: null,
  chrisfarley: null,
  haroldramis: null,
};

// Start AI worker with cron jobs
function startAIWorker() {
  if (!AI_ENABLED) {
    console.log('AI Worker disabled');
    return;
  }

  console.log('Starting AI Worker...');

  // AI Learning - Every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('Running AI learning process...');
    await processAILearning();
  });

  // AI Auto-posting - Every 4 hours
  cron.schedule('0 */4 * * *', async () => {
    console.log('Running AI auto-posting...');
    await createAIPosts();
  });

  // Roblox News - Every 12 hours
  cron.schedule('0 */12 * * *', async () => {
    console.log('Fetching Roblox news...');
    await createRobloxNewsPosts();
  });

  console.log('AI Worker started successfully');
}

// Process AI learning from user interactions
async function processAILearning() {
  try {
    const logs = await aiLogs.getAll();
    const recentLogs = logs.filter(log => {
      const logDate = new Date(log.createdAt);
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
      return logDate > sixHoursAgo;
    });

    if (recentLogs.length === 0) {
      console.log('No new AI interactions to learn from');
      return;
    }

    // Analyze conversation patterns
    const patterns = analyzeConversationPatterns(recentLogs);
    
    // Store learning insights
    await aiLogs.create({
      type: 'LEARNING',
      data: patterns,
      timestamp: new Date().toISOString(),
    });

    console.log(`Processed ${recentLogs.length} AI interactions for learning`);
  } catch (error) {
    console.error('Error in AI learning process:', error);
  }
}

// Analyze conversation patterns
function analyzeConversationPatterns(logs) {
  const patterns = {
    popularTopics: {},
    commonQuestions: [],
    sentimentTrends: {},
    engagementMetrics: {
      totalInteractions: logs.length,
      avgResponseTime: 0,
      userSatisfaction: 0,
    },
  };

  logs.forEach(log => {
    // Extract topics
    if (log.message) {
      const words = log.message.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 4) {
          patterns.popularTopics[word] = (patterns.popularTopics[word] || 0) + 1;
        }
      });
    }
  });

  return patterns;
}

// Create AI-generated posts for AI avatars
async function createAIPosts() {
  try {
    if (!OPENAI_API_KEY) {
      console.log('OpenAI API key not configured, skipping AI posts');
      return;
    }

    const avatarKeys = Object.keys(AI_AVATARS).filter(key => 
      process.env[`AI_${key.toUpperCase()}_ENABLED`] === 'true'
    );

    for (const avatarKey of avatarKeys) {
      const avatarUser = await users.findOne({ 
        username: `${avatarKey}Official` 
      });
      
      if (!avatarUser) continue;

      const postContent = await generateAIPostContent(avatarKey);
      
      if (postContent) {
        await posts.create({
          userId: avatarUser.id,
          content: postContent,
          type: 'text',
          likes: [],
          comments: [],
          isAIGenerated: true,
        });

        console.log(`Created AI post for ${avatarKey}`);
      }
    }
  } catch (error) {
    console.error('Error creating AI posts:', error);
  }
}

// Generate post content using OpenAI
async function generateAIPostContent(avatarName) {
  try {
    const personalities = {
      bettywhite: 'witty comedian sharing life wisdom and humor',
      robinwilliams: 'energetic comedian with heartfelt messages',
      johnnyhardwick: 'voice actor sharing animation insights',
      jonathanjoss: 'thoughtful voice actor discussing craft',
      dianekeaton: 'sophisticated actress sharing creative thoughts',
      shelleyduvall: 'artistic actress with unique perspectives',
      michelletrachtenberg: 'young actress connecting with fans',
      jamesearlJones: 'legendary voice actor with powerful presence',
      matthewperry: 'witty actor with comedic observations',
      johncandy: 'lovable comedian spreading joy',
      chrisfarley: 'energetic comedian with physical humor',
      haroldramis: 'clever writer-director with smart humor',
    };

    const prompt = `You are ${avatarName}, a ${personalities[avatarName]}. Create a short, engaging social media post (2-3 sentences) that fits your personality. Make it authentic and relatable to game developers and creators. No hashtags.`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Create a post for today' },
        ],
        max_tokens: 150,
        temperature: 0.8,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error(`Error generating content for ${avatarName}:`, error.response?.data || error.message);
    return null;
  }
}

// Create posts from Roblox news
async function createRobloxNewsPosts() {
  try {
    const news = await fetchRobloxNews();
    
    if (!news.articles || news.articles.length === 0) {
      console.log('No new Roblox news found');
      return;
    }

    // Find site manager AI account
    const siteManager = await users.findOne({ 
      username: 'GameKillersStudioBot' 
    });
    
    if (!siteManager) {
      console.log('Site manager account not found');
      return;
    }

    // Create posts for latest news
    for (const article of news.articles.slice(0, 3)) {
      await posts.create({
        userId: siteManager.id,
        content: `📰 Roblox News: ${article.title}\n\n${article.summary}\n\nRead more: ${article.url}`,
        type: 'text',
        likes: [],
        comments: [],
        isAIGenerated: true,
        tags: ['roblox', 'news', 'development'],
      });
    }

    console.log(`Created ${news.articles.slice(0, 3).length} Roblox news posts`);
  } catch (error) {
    console.error('Error creating Roblox news posts:', error);
  }
}

// Log AI interaction
async function logAIInteraction(avatarName, userId, message, response) {
  try {
    await aiLogs.create({
      avatarName,
      userId,
      message,
      response,
      type: 'CHAT',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging AI interaction:', error);
  }
}

module.exports = {
  startAIWorker,
  processAILearning,
  createAIPosts,
  createRobloxNewsPosts,
  generateAIPostContent,
  logAIInteraction,
  AI_AVATARS,
};