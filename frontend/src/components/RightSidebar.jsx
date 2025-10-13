import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Users, TrendingUp, Sparkles, MessageCircle, Bot } from 'lucide-react';
import { Button } from './ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const RightSidebar = ({ currentUser, onOpenChat }) => {
  const [friends, setFriends] = useState([]);
  const [aiAvatars, setAiAvatars] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [friendsRes, aiRes, trendingRes] = await Promise.all([
        axios.get(`${API}/friends/online`),
        axios.get(`${API}/ai-avatars`),
        axios.get(`${API}/trending`)
      ]);
      setFriends(friendsRes.data);
      setAiAvatars(aiRes.data);
      setTrendingTopics(trendingRes.data);
    } catch (error) {
      console.error('Failed to fetch sidebar data:', error);
      // Use demo data
      const { getDemoFriends, getDemoAIAvatars, getDemoTrending } = await import('../demoData');
      setFriends(getDemoFriends());
      setAiAvatars(getDemoAIAvatars());
      setTrendingTopics(getDemoTrending());
    }
  };

  const onlineFriends = friends.filter(f => f.status === 'online');

  return (
    <div className="space-y-6">
      {/* Mini AI Avatars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4"
      >
        <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <Bot className="w-4 h-4" />
          AI Assistants
        </h3>
        <div className="space-y-2">
          {aiAvatars.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">Loading...</p>
          ) : (
            aiAvatars.map((ai, index) => (
              <motion.div
                key={ai.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onOpenChat(ai)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-cyan-500/10 cursor-pointer transition-all group"
              >
                <div className="relative">
                  <img
                    src={ai.avatar}
                    alt={ai.name}
                    className="w-10 h-10 rounded-full border-2 border-magenta-500/50 group-hover:border-magenta-400 transition-colors"
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0b0f14] ${
                    ai.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{ai.name}</p>
                  <p className="text-xs text-gray-400 truncate">{ai.specialty}</p>
                </div>
                <MessageCircle className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Online Friends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4"
      >
        <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Online Friends ({onlineFriends.length})
        </h3>
        <div className="space-y-2">
          {onlineFriends.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No friends online</p>
          ) : (
            onlineFriends.map((friend, index) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onOpenChat(friend)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-cyan-500/10 cursor-pointer transition-all group"
              >
                <div className="relative">
                  <img
                    src={friend.avatar}
                    alt={friend.username}
                    className="w-10 h-10 rounded-full border-2 border-cyan-500/50 group-hover:border-cyan-400 transition-colors"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0b0f14]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{friend.displayName}</p>
                  <p className="text-xs text-gray-400 truncate">Level {friend.level}</p>
                </div>
                <MessageCircle className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Trending Topics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4"
      >
        <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Trending Topics
        </h3>
        <div className="space-y-3">
          {trendingTopics.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">Loading...</p>
          ) : (
            trendingTopics.map((topic, index) => (
              <motion.div
                key={topic.tag}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="cursor-pointer hover:bg-cyan-500/10 p-2 rounded-lg transition-all"
              >
                <p className="text-sm font-semibold text-cyan-400">#{topic.tag}</p>
                <p className="text-xs text-gray-400">{topic.posts} posts</p>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Suggested Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4"
      >
        <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Suggested for You
        </h3>
        <div className="space-y-3">
          <p className="text-sm text-gray-400 text-center py-4">Coming soon</p>
        </div>
      </motion.div>
    </div>
  );
};

export default RightSidebar;
