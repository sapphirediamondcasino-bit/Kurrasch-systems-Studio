import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Film, Users, Calendar, Play, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Movies = () => {
  const [movieNights, setMovieNights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovieNights();
  }, []);

  const fetchMovieNights = async () => {
    try {
      const response = await axios.get(`${API}/movie-nights`);
      setMovieNights(response.data);
    } catch (error) {
      console.error('Failed to fetch movie nights:', error);
      // Use demo data
      const { getDemoMovieNights } = await import('../demoData');
      setMovieNights(getDemoMovieNights());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold neon-text mb-2">Movie Night</h1>
          <p className="text-gray-400">Watch together, chat live, and connect with the community</p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-magenta-500 hover:from-cyan-600 hover:to-magenta-600 text-white font-semibold gap-2 glow-effect">
          <Plus className="w-5 h-5" />
          Host Movie Night
        </Button>
      </motion.div>

      {/* Live Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          Live Now
        </h2>
        <div className="glass-card p-8 text-center">
          <p className="text-gray-400">No live sessions at the moment. Check back soon!</p>
        </div>
      </motion.div>

      {/* Upcoming Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Upcoming Sessions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {movieNights.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="glass-card overflow-hidden group hover:border-cyan-400 transition-all"
            >
              <div className="relative overflow-hidden">
                <img
                  src={movie.thumbnail}
                  alt={movie.title}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f14] via-transparent to-transparent" />
                <div className="absolute top-3 right-3 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Upcoming
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 neon-text">{movie.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{movie.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>Hosted by <span className="text-cyan-400 font-semibold">{movie.host.displayName}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span>{new Date(movie.scheduledAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>{movie.participants} / {movie.maxParticipants} participants</span>
                  </div>
                </div>

                <Link to={`/movies/${movie.id}`}>
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-magenta-500 hover:from-cyan-600 hover:to-magenta-600 text-white font-semibold gap-2">
                    <Play className="w-4 h-4" />
                    Join Session
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How it Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 glass-card p-8"
      >
        <h2 className="text-2xl font-bold text-cyan-400 mb-6">How Movie Night Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-white mb-2">Schedule</h3>
            <p className="text-sm text-gray-400">Browse upcoming sessions or host your own movie night</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-magenta-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-white mb-2">Watch Together</h3>
            <p className="text-sm text-gray-400">Join synchronized viewing with real-time chat</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-magenta-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Film className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-white mb-2">Connect</h3>
            <p className="text-sm text-gray-400">Chat, react, and build community while watching</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Movies;
