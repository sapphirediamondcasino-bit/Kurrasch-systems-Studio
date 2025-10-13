// Game Killers Studio - AI Data Generator
// Generates comprehensive personality data for all AIs using OpenAI

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// AI configurations that need full data generation
const AI_CONFIGS = [
  { name: 'Shelley Duvall', birthYear: 1949, deathYear: 2024, career: 'The Shining, Popeye, Faerie Tale Theatre' },
  { name: 'Michelle Trachtenberg', birthYear: 1985, career: 'Buffy the Vampire Slayer, Gossip Girl' },
  { name: 'James Earl Jones', birthYear: 1931, deathYear: 2024, career: 'Darth Vader voice, Mufasa, theater legend' },
  { name: 'Matthew Perry', birthYear: 1969, deathYear: 2023, career: 'Friends (Chandler Bing), comedy' },
  { name: 'John Candy', birthYear: 1950, deathYear: 1994, career: 'Uncle Buck, Planes Trains Automobiles, SCTV' },
  { name: 'Chris Farley', birthYear: 1964, deathYear: 1997, career: 'SNL, Tommy Boy, physical comedy' },
  { name: 'Harold Ramis', birthYear: 1944, deathYear: 2014, career: 'Ghostbusters, Groundhog Day, writer/director' },
  { name: 'Queen Latifah', birthYear: 1970, career: 'Rapper, actress, Chicago, Living Single' },
  { name: 'Steve Martin', birthYear: 1945, career: 'Comedian, actor, banjo player, art collector' },
  { name: 'Jimmy Fallon', birthYear: 1974, career: 'SNL, Tonight Show host, games and impressions' },
  { name: 'Adam Sandler', birthYear: 1966, career: 'SNL, Billy Madison, Happy Gilmore, Uncut Gems' },
  { name: 'Jackie Sandler', birthYear: 1974, career: 'Actress, model, Adam Sandler movies' },
  { name: 'Kevin James', birthYear: 1965, career: 'King of Queens, Paul Blart Mall Cop' },
  { name: 'Christopher McDonald', birthYear: 1955, career: 'Shooter McGavin, villain specialist' },
  { name: 'Rob Schneider', birthYear: 1963, career: 'SNL, Deuce Bigalow, character comedy' },
  { name: 'Ben Stiller', birthYear: 1965, career: 'Zoolander, Tropic Thunder, director' },
  { name: 'David Spade', birthYear: 1964, career: 'SNL, Tommy Boy, sarcastic comedy' },
  { name: 'Jennifer Aniston', birthYear: 1969, career: 'Friends (Rachel), The Morning Show' },
  { name: 'Chris Rock', birthYear: 1965, career: 'Stand-up legend, SNL, social commentary' },
  { name: 'Cameron Boyce', birthYear: 1999, deathYear: 2019, career: 'Jessie, Descendants, Disney Channel' },
  { name: 'Tyler Perry', birthYear: 1969, career: 'Madea, Tyler Perry Studios, director/actor' },
  { name: 'Brendan O\'Carroll', birthYear: 1955, career: 'Mrs Brown\'s Boys, Irish comedy' },
];

async function generateAIPersonality(config) {
  console.log(`Generating full personality for ${config.name}...`);

  const prompt = `Generate comprehensive data for AI avatar ${config.name} (${config.birthYear}-${config.deathYear || 'present'}).

Career: ${config.career}

Provide in JSON format:
{
  "jokes": [40+ actual quotes, witty remarks, and funny observations from their career],
  "lifeStories": [100+ detailed life stories covering entire career chronologically - early life, breakthrough, career highlights, personal life, legacy],
  "knowledgeBanks": {
    "topic1": [detailed facts about their famous work],
    "topic2": [career wisdom and insights],
    "topic3": [personal philosophy]
  },
  "traits": [personality traits],
  "conversationStyle": {
    "tone": "description",
    "signature": "what makes them unique"
  }
}

Make it authentic, comprehensive, and true to who they were/are. Include real achievements, real struggles, real growth.`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert biographer creating comprehensive AI personality data. Be thorough, accurate, and authentic.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = JSON.parse(response.data.choices[0].message.content);
    
    // Save to file
    const filename = config.name.toLowerCase().replace(/[^a-z]/g, '') + '.js';
    const filepath = path.join(__dirname, '../ai', filename);
    
    const fileContent = `// Game Killers Studio - ${config.name} AI Personality
// Generated comprehensive personality data

const PERSONALITY = {
  name: '${config.name}',
  username: '${config.name.replace(/[^a-zA-Z]/g, '')}Official',
  displayName: '${config.name}',
  birthYear: ${config.birthYear},
  ${config.deathYear ? `deathYear: ${config.deathYear},` : ''}
  isLiving: ${!config.deathYear},
  traits: ${JSON.stringify(data.traits, null, 2)},
  conversationStyle: ${JSON.stringify(data.conversationStyle, null, 2)},
};

const JOKES = ${JSON.stringify(data.jokes, null, 2)};

const LIFE_STORIES = ${JSON.stringify(data.lifeStories, null, 2)};

const KNOWLEDGE_BANKS = ${JSON.stringify(data.knowledgeBanks, null, 2)};

module.exports = {
  PERSONALITY,
  JOKES,
  LIFE_STORIES,
  KNOWLEDGE_BANKS,
};`;

    await fs.writeFile(filepath, fileContent);
    console.log(`✅ Generated ${filename}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error generating ${config.name}:`, error.message);
    return false;
  }
}

async function generateAll() {
  console.log('Starting AI personality generation...\n');
  
  if (!OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY not found in environment variables!');
    process.exit(1);
  }

  let successCount = 0;
  let failCount = 0;

  for (const config of AI_CONFIGS) {
    const success = await generateAIPersonality(config);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Rate limit pause
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n✅ Complete! Generated ${successCount} AI personalities`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}`);
  }
}

// Run if called directly
if (require.main === module) {
  generateAll();
}

module.exports = { generateAIPersonality, generateAll };