import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Users, Send, Settings, Volume2, Maximize, Play, Pause } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MovieSession = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovieSession();
  }, [id]);

  const fetchMovieSession = async () => {
    try {
      const [movieRes, chatRes] = await Promise.all([
        axios.get(`${API}/movie-nights/${id}`),
        axios.get(`${API}/movie-nights/${id}/chat`)
      ]);
      setMovie(movieRes.data);
      setChatMessages(chatRes.data);
    } catch (error) {
      console.error('Failed to fetch movie session:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !movie) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <div className="text-cyan-400">Loading session...</div>
      </div>
    );
  }

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      setChatMessages([...chatMessages, {
        id: Date.now().toString(),
        userId: 'me',
        username: 'You',
        message: chatMessage,
        timestamp: new Date()
      }]);
      setChatMessage('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold neon-text mb-2">{movie.title}</h1>
        <div className="flex items-center gap-4 text-gray-400">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {movie.participants} watching
          </span>
          <span>Hosted by <span className="text-cyan-400">{movie.host.displayName}</span></span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="glass-card overflow-hidden">
            {/* Video Container */}
            <div className="relative bg-black aspect-video flex items-center justify-center">
              <img
                src={movie.thumbnail}
                alt={movie.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-20 h-20 rounded-full bg-cyan-500/80 hover:bg-cyan-500 backdrop-blur-sm"
                >
                  {isPlaying ? (
                    <Pause className="w-10 h-10 text-white" />
                  ) : (
                    <Play className="w-10 h-10 text-white ml-1" />
                  )}
                </Button>
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 bg-slate-900/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-cyan-400 hover:text-cyan-300">
                    <Volume2 className="w-5 h-5" />
                  </Button>
                  <span className="text-sm text-gray-400 ml-2">0:00 / 1:30:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-cyan-400 hover:text-cyan-300">
                    <Settings className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-cyan-400 hover:text-cyan-300">
                    <Maximize className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Movie Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 mt-6"
          >
            <h2 className="text-xl font-bold text-cyan-400 mb-3">About This Session</h2>
            <p className="text-gray-300 mb-4">{movie.description}</p>
            <div className="flex items-center gap-2">
              <img
                src={movie.host.avatar}
                alt={movie.host.displayName}
                className="w-10 h-10 rounded-full border-2 border-cyan-500/50"
              />
              <div>
                <p className="font-semibold text-white">{movie.host.displayName}</p>
                <p className="text-sm text-gray-400">Host</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Live Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="glass-card flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
            {/* Chat Header */}
            <div className="p-4 border-b-2 border-cyan-500/20">
              <h3 className="font-bold text-cyan-400 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Live Chat ({movie.participants})
              </h3>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-custom p-4 space-y-3">
              {chatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2"
                >
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-cyan-400 text-sm">{msg.username}</span>
                      <span className="text-xs text-gray-500">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{msg.message}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-cyan-500/20">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1 bg-slate-900/50 border-cyan-500/30 focus:border-cyan-400 text-white text-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MovieSession;
