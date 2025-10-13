import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, BookOpen, Video, Download, ExternalLink, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const tutorials = [
  {
    id: 't1',
    category: 'Pet Simulator',
    title: 'Creating a Pet Collection System',
    description: 'Learn how to create a robust pet collection and upgrade system',
    difficulty: 'Intermediate',
    duration: '45 min',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop'
  },
  {
    id: 't2',
    category: 'Tycoon',
    title: 'Building Your First Tycoon Game',
    description: 'Step-by-step guide to creating a functional tycoon game',
    difficulty: 'Beginner',
    duration: '60 min',
    thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop'
  },
  {
    id: 't3',
    category: 'Obby',
    title: 'Advanced Obby Mechanics',
    description: 'Create challenging and engaging obstacle courses',
    difficulty: 'Advanced',
    duration: '30 min',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop'
  }
];

const DevHub = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'pet-simulator', name: 'Pet Simulator', count: 5 },
    { id: 'tycoon', name: 'Tycoon', count: 5 },
    { id: 'obby', name: 'Obby', count: 5 },
    { id: 'pvp', name: 'PvP/Combat', count: 5 },
    { id: 'rpg', name: 'RPG', count: 5 },
    { id: 'discord-bot', name: 'Discord Bots', count: 8 },
    { id: 'clothing', name: 'Clothing Templates', count: 12 }
  ];

  const difficultyColors = {
    'Beginner': 'bg-green-500',
    'Intermediate': 'bg-yellow-500',
    'Advanced': 'bg-red-500'
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold neon-text mb-2">Developer Hub</h1>
        <p className="text-gray-400">Learn to build amazing Roblox games and Discord bots</p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">45+</p>
              <p className="text-sm text-gray-400">Tutorials</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-magenta-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">30+</p>
              <p className="text-sm text-gray-400">Video Guides</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-magenta-500 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">100+</p>
              <p className="text-sm text-gray-400">Resources</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="roblox" className="w-full">
        <TabsList className="glass-card w-full justify-start mb-6 p-1">
          <TabsTrigger value="roblox" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Roblox Development
          </TabsTrigger>
          <TabsTrigger value="discord" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Discord Bots
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Roblox Development */}
        <TabsContent value="roblox" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Roblox Game Development</h2>
            
            {/* Categories */}
            <div className="glass-card p-4 mb-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setSelectedCategory('all')}
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  className={selectedCategory === 'all' 
                    ? 'bg-cyan-500 hover:bg-cyan-600' 
                    : 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10'
                  }
                >
                  All Genres
                </Button>
                {categories.filter(c => !['discord-bot', 'clothing'].includes(c.id)).map((cat) => (
                  <Button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    className={selectedCategory === cat.id 
                      ? 'bg-cyan-500 hover:bg-cyan-600' 
                      : 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10'
                    }
                  >
                    {cat.name} ({cat.count})
                  </Button>
                ))}
              </div>
            </div>

            {/* Tutorial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials.map((tutorial, index) => (
                <motion.div
                  key={tutorial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card overflow-hidden group cursor-pointer hover:border-cyan-400 transition-all"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={tutorial.thumbnail}
                      alt={tutorial.title}
                      className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className={`${difficultyColors[tutorial.difficulty]} text-white border-0`}>
                        {tutorial.difficulty}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-cyan-400 font-semibold">
                      {tutorial.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-cyan-400 mb-2 font-semibold">{tutorial.category}</p>
                    <h3 className="font-bold text-white mb-2 line-clamp-2">{tutorial.title}</h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{tutorial.description}</p>
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-magenta-500 hover:from-cyan-600 hover:to-magenta-600 text-white gap-2">
                      <BookOpen className="w-4 h-4" />
                      Start Learning
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* Discord Bots */}
        <TabsContent value="discord" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Discord Bot Development</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Getting Started with Discord.js', level: 'Beginner', duration: '30 min' },
                { title: 'Creating Slash Commands', level: 'Intermediate', duration: '45 min' },
                { title: 'Database Integration', level: 'Advanced', duration: '60 min' },
                { title: 'Music Bot Tutorial', level: 'Intermediate', duration: '90 min' }
              ].map((tutorial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 hover:border-cyan-400 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-white text-lg">{tutorial.title}</h3>
                    <Badge className={`${difficultyColors[tutorial.level]} text-white border-0`}>
                      {tutorial.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{tutorial.duration}</p>
                  <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white gap-2">
                    <Code className="w-4 h-4" />
                    View Tutorial
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Clothing Templates & Assets</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card overflow-hidden group cursor-pointer hover:border-cyan-400 transition-all"
                >
                  <div className="aspect-square bg-gradient-to-br from-cyan-500/20 to-magenta-500/20 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-4xl">
                      Template {index + 1}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-white mb-2">Template {index + 1}</p>
                    <Button size="sm" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white gap-1">
                      <Download className="w-3 h-3" />
                      Download
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Resources Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 glass-card p-6"
      >
        <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          External Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Roblox Developer Hub', url: 'https://create.roblox.com/docs' },
            { name: 'Discord.js Documentation', url: 'https://discord.js.org' },
            { name: 'Lua Learning', url: 'https://www.lua.org/docs.html' },
            { name: 'DevForum', url: 'https://devforum.roblox.com' }
          ].map((resource, index) => (
            <motion.a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border-2 border-cyan-500/30 hover:border-cyan-400 transition-all group"
            >
              <span className="text-white font-semibold">{resource.name}</span>
              <ExternalLink className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DevHub;
