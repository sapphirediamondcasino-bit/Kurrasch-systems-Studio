import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { TrendingUp, Flame, Star, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import PostCard from '../components/PostCard';
import GameCard from '../components/GameCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Discover = () => {
  const [activeTab, setActiveTab] = useState('trending');
  const [posts, setPosts] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postsRes, gamesRes] = await Promise.all([
        axios.get(`${API}/posts/trending`),
        axios.get(`${API}/games?featured=true`)
      ]);
      setPosts(postsRes.data);
      setGames(gamesRes.data);
    } catch (error) {
      console.error('Failed to fetch discover data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold neon-text mb-2">Discover</h1>
        <p className="text-gray-400">Explore trending games, posts, and creators</p>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="glass-card w-full justify-start mb-6 p-1">
          <TabsTrigger value="trending" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 gap-2">
            <TrendingUp className="w-4 h-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="hot" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 gap-2">
            <Flame className="w-4 h-4" />
            Hot
          </TabsTrigger>
          <TabsTrigger value="new" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 gap-2">
            <Clock className="w-4 h-4" />
            New
          </TabsTrigger>
          <TabsTrigger value="top" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 gap-2">
            <Star className="w-4 h-4" />
            Top
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-6">
          {/* Featured Games Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Featured Games</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {games.filter(g => g.featured).map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </motion.div>

          {/* Trending Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-cyan-400 mb-4 mt-8">Trending Posts</h2>
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="hot" className="space-y-6">
          {posts.filter(p => p.likes > 300).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </TabsContent>

        <TabsContent value="new" className="space-y-6">
          {[...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </TabsContent>

        <TabsContent value="top" className="space-y-6">
          {[...posts].sort((a, b) => b.likes - a.likes).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Discover;
