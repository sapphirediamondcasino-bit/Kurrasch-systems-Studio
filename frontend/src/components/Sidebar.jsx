import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home, Compass, Gamepad2, Code, Users,
  Trophy, Star, TrendingUp, BookOpen, Film,
  LayoutDashboard, Settings, Shield
} from 'lucide-react';
import { Progress } from './ui/progress';

const Sidebar = ({ currentUser }) => {
  const location = useLocation();
  
  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Discover', path: '/discover' },
    { icon: Gamepad2, label: 'Games', path: '/games' },
    { icon: Code, label: 'Dev Hub', path: '/devhub' },
    { icon: Film, label: 'Movie Night', path: '/movies' },
    { icon: Users, label: 'Friends', path: '/friends' },
    { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const xpProgress = (currentUser.xp / currentUser.xpToNextLevel) * 100;

  return (
    <div className="h-full glass-card border-r-2 border-cyan-500/20 overflow-y-auto scrollbar-custom">
      <div className="p-4 space-y-6">
        {/* User XP Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 glow-effect"
        >
          <Link to={`/profile/${currentUser.id}`} className="block">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-12 h-12 rounded-full border-2 border-cyan-500/50 glow-effect"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{currentUser.displayName}</p>
                <p className="text-sm text-gray-400 truncate">@{currentUser.username}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-cyan-400 font-medium flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Level {currentUser.level}
                </span>
                <span className="text-gray-400">{currentUser.xp}/{currentUser.xpToNextLevel} XP</span>
              </div>
              <Progress value={xpProgress} className="h-2 bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-magenta-500 transition-all duration-300 rounded-full glow-effect"
                  style={{ width: `${xpProgress}%` }}
                />
              </Progress>
            </div>
          </Link>
        </motion.div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    active
                      ? 'bg-cyan-500/20 border-2 border-cyan-500/50 text-cyan-400 glow-effect'
                      : 'text-gray-400 hover:bg-cyan-500/10 hover:text-cyan-300 border-2 border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4"
        >
          <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Your Stats
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Friends</span>
              <span className="text-sm font-semibold text-white">{currentUser.friends}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Followers</span>
              <span className="text-sm font-semibold text-white">{currentUser.followers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Following</span>
              <span className="text-sm font-semibold text-white">{currentUser.following}</span>
            </div>
          </div>
        </motion.div>

        {/* Subscription Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-4 glow-effect"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-magenta-500 flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-cyan-400 uppercase">{currentUser.subscriptionTier}</p>
              <p className="text-xs text-gray-400">Member</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Sidebar;
