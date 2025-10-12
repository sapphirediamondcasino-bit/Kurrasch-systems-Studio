import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { messages } from '../mock';

const ChatBox = ({ user, onClose }) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: '1', senderId: user.id, content: 'Hey! How are you?', timestamp: new Date() }
  ]);
  const [minimized, setMinimized] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setChatMessages([...chatMessages, {
        id: Date.now().toString(),
        senderId: 'me',
        content: message,
        timestamp: new Date()
      }]);
      setMessage('');
      
      // Simulate AI response for AI avatars
      if (user.specialty) {
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            senderId: user.id,
            content: `That's interesting! As a ${user.specialty} specialist, I'd love to help you with that.`,
            timestamp: new Date()
          }]);
        }, 1000);
      }
    }
  };

  return (
    <motion.div
      className="w-80 glass-card border-2 border-cyan-500/30 overflow-hidden flex flex-col"
      style={{ height: minimized ? '60px' : '400px' }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b-2 border-cyan-500/20 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name || user.username}
              className="w-8 h-8 rounded-full border-2 border-cyan-500/50"
            />
            {user.status && (
              <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#0b0f14] ${
                user.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
              }`} />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{user.name || user.displayName}</p>
            {user.specialty && (
              <p className="text-xs text-gray-400">{user.specialty}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-gray-400 hover:text-cyan-400"
            onClick={() => setMinimized(!minimized)}
          >
            {minimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-gray-400 hover:text-magenta-400"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-custom p-3 space-y-3 bg-slate-900/50">
            {chatMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] rounded-lg p-2 ${
                  msg.senderId === 'me'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-800 text-white border border-cyan-500/30'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t-2 border-cyan-500/20 bg-slate-900/80">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-slate-800/50 border-cyan-500/30 focus:border-cyan-400 text-white text-sm"
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
        </>
      )}
    </motion.div>
  );
};

export default ChatBox;
