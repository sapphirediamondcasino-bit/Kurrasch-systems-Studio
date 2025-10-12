import React from 'react';
import { motion } from 'framer-motion';
import { Play, Users, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const GameCard = ({ game }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card overflow-hidden group cursor-pointer"
    >
      <Link to={`/games/${game.id}`}>
        <div className="relative overflow-hidden">
          <img
            src={game.thumbnail}
            alt={game.title}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f14] via-transparent to-transparent opacity-60" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              <h3 className="text-lg font-bold text-white neon-text">{game.title}</h3>
              <p className="text-sm text-gray-300">{game.genre}</p>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{game.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-cyan-400">
              <Users className="w-4 h-4" />
              {game.players.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-yellow-400">
              <Star className="w-4 h-4 fill-yellow-400" />
              {game.rating}
            </span>
          </div>
        </div>

        <Button className="w-full bg-gradient-to-r from-cyan-500 to-magenta-500 hover:from-cyan-600 hover:to-magenta-600 text-white font-semibold gap-2 glow-effect">
          <Play className="w-4 h-4" />
          Play Now
        </Button>
      </div>
    </motion.div>
  );
};

export default GameCard;
