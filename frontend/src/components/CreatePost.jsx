import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Image, Video, Smile, Send, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

const CreatePost = ({ currentUser, ...props }) => {
  const [content, setContent] = useState('');
  const [isAIAssisted, setIsAIAssisted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim()) {
      try {
        const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
        const response = await axios.post(`${API}/posts`, {
          content,
          aiAssisted: isAIAssisted
        });
        if (props.onPostCreated) {
          props.onPostCreated(response.data);
        }
        setContent('');
        setIsAIAssisted(false);
      } catch (error) {
        console.error('Failed to create post:', error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 mb-6"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.username}
            className="w-12 h-12 rounded-full border-2 border-cyan-500/50"
          />
          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] bg-slate-900/50 border-cyan-500/30 focus:border-cyan-400 text-white resize-none"
            />
            
            {/* AI Assist Toggle */}
            {content.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAIAssisted(!isAIAssisted)}
                  className={`gap-2 ${isAIAssisted ? 'text-magenta-400 bg-magenta-500/10' : 'text-gray-400'}`}
                >
                  <Sparkles className="w-4 h-4" />
                  AI Enhancement {isAIAssisted ? 'ON' : 'OFF'}
                </Button>
              </motion.div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="icon" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                  <Image className="w-5 h-5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                  <Video className="w-5 h-5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                  <Smile className="w-5 h-5" />
                </Button>
              </div>
              <Button
                type="submit"
                disabled={!content.trim()}
                className="bg-gradient-to-r from-cyan-500 to-magenta-500 hover:from-cyan-600 hover:to-magenta-600 text-white font-semibold gap-2 glow-effect"
              >
                <Send className="w-4 h-4" />
                Post
              </Button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default CreatePost;
