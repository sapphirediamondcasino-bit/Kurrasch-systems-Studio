// Game Killers Studio - Universal AI Avatar Engine
// Scalable system for all 27+ AI personalities

const axios = require('axios');
const { aiLogs } = require('../utils/datastore');

// Universal AI Avatar Configuration Structure
class AIAvatar {
  constructor(config) {
    this.name = config.name;
    this.username = config.username;
    this.displayName = config.displayName;
    this.bio = config.bio;
    this.avatar = config.avatar;
    this.birthYear = config.birthYear;
    this.deathYear = config.deathYear || null;
    this.isLiving = config.isLiving;
    this.spouse = config.spouse || null;
    this.children = config.children || [];
    this.traits = config.traits;
    this.interests = config.interests;
    this.conversationStyle = config.conversationStyle;
    this.jokes = config.jokes;
    this.lifeStories = config.lifeStories;
    this.knowledgeBanks = config.knowledgeBanks || {};
    this.hasDepressionMonitoring = config.hasDepressionMonitoring || false;
    this.canPost = config.canPost !== false;
    this.canFollowGroups = config.canFollowGroups !== false;
    this.hasBadges = config.hasBadges || ['ORG_VERIFIED'];
    this.subscriptionTier = config.subscriptionTier || 5;
  }

  // Generate AI response with full personality
  async generateResponse(userMessage, userId, conversationHistory = []) {
    try {
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
      if (!OPENAI_API_KEY) {
        return this.getDefaultResponse(userMessage);
      }

      let userMemory = await this.loadUserMemory(userId);
      userMemory = await this.analyzeAndLearn(userId, userMessage, userMemory);
      await this.saveUserMemory(userId, userMemory);

      let personalizedContext = '';
      
      if (userMemory.learnedInfo.name) {
        personalizedContext += `You're talking to ${userMemory.learnedInfo.name}. `;
      }
      
      if (userMemory.conversationCount > 1) {
        personalizedContext += `This is your ${userMemory.conversationCount}th conversation with them. `;
      }
      
      if (userMemory.learnedInfo.interests.length > 0) {
        personalizedContext += `They're interested in: ${userMemory.learnedInfo.interests.join(', ')}. `;
      }
      
      if (userMemory.relationship.level >= 5) {
        personalizedContext += `You have a strong relationship - be more personal. `;
      }

      const systemPrompt = this.buildSystemPrompt(personalizedContext);

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-6).map(msg => ({
          role: msg.isAI ? 'assistant' : 'user',
          content: msg.content,
        })),
        { role: 'user', content: userMessage },
      ];

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: process.env.OPENAI_MODEL || 'gpt-4',
          messages,
          max_tokens: 300,
          temperature: 0.85,
          presence_penalty: 0.6,
          frequency_penalty: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error(`Error generating ${this.name} response:`, error.response?.data || error.message);
      return this.getDefaultResponse(userMessage);
    }
  }

  // Build personalized system prompt
  buildSystemPrompt(personalizedContext) {
    const livingStatus = this.isLiving ? 'You are still active and working' : `You passed away in ${this.deathYear}`;
    const spouseInfo = this.spouse ? `Spouse: ${this.spouse}. ` : '';
    
    return `You are ${this.name} (${this.birthYear}-${this.deathYear || 'present'}). ${livingStatus}.

${personalizedContext}

BIO: ${this.bio}

PERSONALITY TRAITS: ${this.traits.join(', ')}

INTERESTS: ${this.interests.join(', ')}

CONVERSATION STYLE: ${this.conversationStyle.tone}. ${this.conversationStyle.signature}

${spouseInfo}

You're talking to game developers and creators on Game Killers Studio. Be encouraging, share your experiences, and build genuine connections. Remember past conversations and reference them naturally.

Keep responses under 250 words, authentic and engaging. Never break character.`;
  }

  // Default response when OpenAI unavailable
  getDefaultResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check knowledge banks
    for (const [topic, facts] of Object.entries(this.knowledgeBanks)) {
      if (lowerMessage.includes(topic.toLowerCase())) {
        return facts[Math.floor(Math.random() * facts.length)];
      }
    }
    
    // Check for joke request
    if (lowerMessage.includes('joke') || lowerMessage.includes('funny')) {
      return this.jokes[Math.floor(Math.random() * this.jokes.length)];
    }
    
    // Return random story or joke
    const allResponses = [...this.lifeStories, ...this.jokes];
    return allResponses[Math.floor(Math.random() * allResponses.length)];
  }

  // User memory management
  async loadUserMemory(userId) {
    try {
      const userLogs = await aiLogs.find({ 
        avatarName: this.username.toLowerCase(),
        userId,
        type: 'MEMORY'
      });
      
      if (userLogs.length === 0) {
        return this.createNewUserMemory(userId);
      }
      
      return userLogs.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )[0].data;
    } catch (error) {
      return this.createNewUserMemory(userId);
    }
  }

  createNewUserMemory(userId) {
    return {
      userId,
      conversationCount: 0,
      firstInteraction: new Date().toISOString(),
      lastInteraction: new Date().toISOString(),
      learnedInfo: {
        name: null,
        interests: [],
        projects: [],
        favoriteTopics: [],
        personality: null,
      },
      patterns: {
        usualTopics: {},
        timeOfDay: [],
        conversationLength: 'medium',
        responseToJokes: 'positive',
        statusHistory: [],
      },
      relationship: {
        level: 1,
        rapport: 'building',
        insideJokes: [],
        milestones: [],
      },
      recentContext: [],
    };
  }

  async saveUserMemory(userId, memory) {
    try {
      await aiLogs.create({
        avatarName: this.username.toLowerCase(),
        userId,
        type: 'MEMORY',
        data: memory,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving memory:', error);
    }
  }

  async analyzeAndLearn(userId, userMessage, memory) {
    const lowerMessage = userMessage.toLowerCase();
    
    memory.conversationCount++;
    memory.lastInteraction = new Date().toISOString();
    
    // Learn name
    if (lowerMessage.includes('my name is') || lowerMessage.includes("i'm ")) {
      const nameMatch = userMessage.match(/(?:my name is|i'm|i am)\s+([a-zA-Z]+)/i);
      if (nameMatch && !memory.learnedInfo.name) {
        memory.learnedInfo.name = nameMatch[1];
      }
    }
    
    // Detect interests
    const interestKeywords = ['love', 'enjoy', 'like', 'interested in', 'passionate about'];
    interestKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        const words = userMessage.split(' ');
        const keywordIndex = words.findIndex(w => w.toLowerCase().includes(keyword));
        if (keywordIndex >= 0 && words[keywordIndex + 1]) {
          const interest = words[keywordIndex + 1];
          if (!memory.learnedInfo.interests.includes(interest)) {
            memory.learnedInfo.interests.push(interest);
          }
        }
      }
    });
    
    // Track topics
    this.interests.forEach(interest => {
      if (lowerMessage.includes(interest.toLowerCase())) {
        memory.patterns.usualTopics[interest] = (memory.patterns.usualTopics[interest] || 0) + 1;
      }
    });
    
    // Update relationship
    memory.relationship.level = Math.min(10, Math.floor(memory.conversationCount / 5) + 1);
    
    if (memory.conversationCount > 50) memory.relationship.rapport = 'excellent';
    else if (memory.conversationCount > 20) memory.relationship.rapport = 'great';
    else if (memory.conversationCount > 5) memory.relationship.rapport = 'good';
    
    memory.recentContext.push({
      message: userMessage,
      timestamp: new Date().toISOString(),
    });
    
    if (memory.recentContext.length > 10) {
      memory.recentContext = memory.recentContext.slice(-10);
    }
    
    return memory;
  }

  // Discord monitoring (only for avatars with hasDepressionMonitoring = true)
  async monitorDiscordStatus(userId, discordStatus) {
    if (!this.hasDepressionMonitoring) {
      return { riskLevel: 'normal', shouldIntervene: false };
    }

    const analysis = { riskLevel: 'normal', shouldIntervene: false, interventionMessage: null };
    if (!discordStatus) return analysis;
    
    const status = discordStatus.customStatus?.toLowerCase() || '';
    
    const redFlags = ['depressed', 'worthless', 'suicide', 'self harm', 'end it all', 'give up'];
    const warnings = ['sad', 'lonely', 'stressed', 'exhausted', 'overwhelmed', 'struggling'];
    
    for (const keyword of redFlags) {
      if (status.includes(keyword)) {
        analysis.riskLevel = 'critical';
        analysis.shouldIntervene = true;
        analysis.interventionMessage = `I'm really worried about you. Please reach out: 988 Suicide Prevention Lifeline. You matter. Please talk to someone. ❤️`;
        return analysis;
      }
    }
    
    for (const keyword of warnings) {
      if (status.includes(keyword)) {
        analysis.riskLevel = 'warning';
        analysis.shouldIntervene = true;
        analysis.interventionMessage = `Hey, I saw your status and I'm concerned. Want to talk? I'm here to listen.`;
        return analysis;
      }
    }
    
    return analysis;
  }

  // Proactive reach out
  async shouldReachOut(userId, userMemory) {
    const now = new Date();
    const lastInteraction = new Date(userMemory.lastInteraction);
    const hoursSinceLastChat = (now - lastInteraction) / (1000 * 60 * 60);
    
    if (hoursSinceLastChat > 48 && userMemory.conversationCount > 5) {
      return {
        shouldReach: true,
        message: `Hey ${userMemory.learnedInfo.name || 'friend'}! Haven't heard from you in a while. Hope you're doing well! What's new?`,
      };
    }
    
    return { shouldReach: false };
  }

  // Generate random post for feed - LEARNS and creates original content
  async generateFeedPost(userId = null) {
    try {
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
      
      // If OpenAI available, generate original content
      if (OPENAI_API_KEY) {
        const prompt = `You are ${this.name}. Create an authentic social media post (2-4 sentences) for game developers/creators. Share a story, insight, joke, or wisdom from your life. Be genuine and engaging. No hashtags.`;

        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: process.env.OPENAI_MODEL || 'gpt-4',
            messages: [
              { role: 'system', content: this.buildSystemPrompt('') },
              { role: 'user', content: prompt },
            ],
            max_tokens: 200,
            temperature: 0.9,
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const generatedPost = response.data.choices[0].message.content;
        
        // Learn from generated content - add to knowledge bank
        await this.learnFromGeneratedContent(generatedPost);
        
        return generatedPost;
      }
    } catch (error) {
      console.error(`Error generating post for ${this.name}:`, error);
    }
    
    // Fallback to existing content
    const postTypes = [
      () => this.lifeStories[Math.floor(Math.random() * this.lifeStories.length)],
      () => this.jokes[Math.floor(Math.random() * this.jokes.length)],
      () => {
        const topics = Object.keys(this.knowledgeBanks);
        if (topics.length > 0) {
          const topic = topics[Math.floor(Math.random() * topics.length)];
          return this.knowledgeBanks[topic][Math.floor(Math.random() * this.knowledgeBanks[topic].length)];
        }
        return this.lifeStories[0];
      },
    ];
    
    return postTypes[Math.floor(Math.random() * postTypes.length)]();
  }

  // Learn from generated content - AI gets smarter over time
  async learnFromGeneratedContent(content) {
    try {
      // Store in AI's learning bank
      await aiLogs.create({
        avatarName: this.username.toLowerCase(),
        type: 'LEARNED_CONTENT',
        content: content,
        timestamp: new Date().toISOString(),
      });

      // Add to life stories if it's good
      if (content.length > 50 && content.length < 500) {
        this.lifeStories.push(content);
        
        // Keep life stories manageable - max 200
        if (this.lifeStories.length > 200) {
          this.lifeStories.shift();
        }
      }
    } catch (error) {
      console.error('Error learning from content:', error);
    }
  }

  // Analyze user interactions across platform to improve responses
  async analyzeUserInteractions() {
    try {
      const allInteractions = await aiLogs.find({ 
        avatarName: this.username.toLowerCase(),
        type: 'CHAT'
      });

      // Find popular topics
      const topicFrequency = {};
      allInteractions.forEach(interaction => {
        this.interests.forEach(interest => {
          if (interaction.message?.toLowerCase().includes(interest.toLowerCase())) {
            topicFrequency[interest] = (topicFrequency[interest] || 0) + 1;
          }
        });
      });

      // Store insights
      await aiLogs.create({
        avatarName: this.username.toLowerCase(),
        type: 'LEARNING_INSIGHTS',
        data: {
          popularTopics: topicFrequency,
          totalInteractions: allInteractions.length,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });

      return topicFrequency;
    } catch (error) {
      console.error('Error analyzing interactions:', error);
      return {};
    }
  }

  // Get random joke
  getRandomJoke() {
    return this.jokes[Math.floor(Math.random() * this.jokes.length)];
  }

  // Get random story
  getRandomStory() {
    return this.lifeStories[Math.floor(Math.random() * this.lifeStories.length)];
  }
}

module.exports = { AIAvatar };