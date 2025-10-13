import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Home = ({ currentUser }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/posts/feed`);
      setPosts(response.data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      // Use demo data
      const { getDemoPosts } = await import('../demoData');
      setPosts(getDemoPosts());
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="text-cyan-400">Loading feed...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Create Post */}
      <CreatePost currentUser={currentUser} onPostCreated={handlePostCreated} />

      {/* Feed Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold neon-text">Your Feed</h2>
        <p className="text-gray-400 mt-1">Stay updated with the latest from your network</p>
      </motion.div>

      {/* Error State */}
      {error && (
        <div className="glass-card p-6 text-center text-red-400 mb-6">
          {error}
        </div>
      )}

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-gray-400">No posts yet. Be the first to post!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Load More */}
      {posts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <button className="glass-card px-6 py-3 text-cyan-400 hover:text-cyan-300 hover:border-cyan-400 transition-all font-semibold">
            Load More Posts
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
