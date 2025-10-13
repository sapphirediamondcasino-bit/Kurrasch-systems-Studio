import React from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Star, Zap, CreditCard, Award, TrendingUp, Target, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Card } from '../components/ui/card';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const subscriptionTiers = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['Basic profile', '100 AI credits/month', 'Community access', 'Standard badge'],
    aiCredits: 100,
    adCredits: 0,
    badge: 'standard'
  },
  {
    id: 'gks_starter',
    name: 'GKS Starter',
    price: 4.99,
    features: ['Enhanced profile', '500 AI credits/month', '100 ad credits/month', 'GKS Starter badge'],
    aiCredits: 500,
    adCredits: 100,
    badge: 'starter'
  },
  {
    id: 'gks_pro',
    name: 'GKS Pro',
    price: 9.99,
    features: ['Premium profile', '2000 AI credits/month', '500 ad credits/month', 'Priority support', 'GKS Pro badge'],
    aiCredits: 2000,
    adCredits: 500,
    badge: 'pro'
  },
  {
    id: 'gks_elite',
    name: 'GKS Elite',
    price: 19.99,
    features: ['Elite profile', 'Unlimited AI credits', '2000 ad credits/month', '24/7 support', 'GKS Elite badge', 'Early access'],
    aiCredits: -1,
    adCredits: 2000,
    badge: 'elite'
  }
];

const Dashboard = ({ currentUser }) => {
  const currentTier = subscriptionTiers.find(t => t.id === currentUser.subscriptionTier);
  const xpProgress = (currentUser.xp / currentUser.xpToNextLevel) * 100;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold neon-text mb-2">Dashboard</h1>
        <p className="text-gray-400">Manage your account, subscriptions, and rewards</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{currentUser.level}</p>
              <p className="text-sm text-gray-400">Level</p>
            </div>
          </div>
          <Progress value={xpProgress} className="h-2 bg-slate-800 mb-2" />
          <p className="text-xs text-gray-400">{currentUser.xp} / {currentUser.xpToNextLevel} XP</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-magenta-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{currentTier?.aiCredits === -1 ? '∞' : currentTier?.aiCredits || 0}</p>
              <p className="text-sm text-gray-400">AI Credits</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-magenta-500 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{currentTier?.adCredits || 0}</p>
              <p className="text-sm text-gray-400">Ad Credits</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{currentUser.badges.length}</p>
              <p className="text-sm text-gray-400">Badges</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Subscription Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Your Subscription</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {subscriptionTiers.map((tier, index) => {
            const isCurrentTier = tier.id === currentUser.subscriptionTier;
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`glass-card p-6 relative ${
                  isCurrentTier ? 'border-cyan-400 glow-effect' : ''
                }`}
              >
                {isCurrentTier && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Current
                    </div>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-1">{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-cyan-400">${tier.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    isCurrentTier
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-gradient-to-r from-cyan-500 to-magenta-500 hover:from-cyan-600 hover:to-magenta-600 text-white glow-effect'
                  }`}
                  disabled={isCurrentTier}
                >
                  {isCurrentTier ? 'Active Plan' : 'Upgrade'}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Goals Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6" />
          Your Goals
        </h2>
        <div className="space-y-4">
          {[
            { name: 'Complete 10 tutorials', progress: 70, current: 7, total: 10 },
            { name: 'Reach Level 50', progress: 84, current: 42, total: 50 },
            { name: 'Publish 3 games', progress: 33, current: 1, total: 3 }
          ].map((goal, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{goal.name}</h3>
                <span className="text-sm text-cyan-400">{goal.current} / {goal.total}</span>
              </div>
              <Progress value={goal.progress} className="h-3 bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-magenta-500 transition-all duration-300 rounded-full"
                  style={{ width: `${goal.progress}%` }}
                />
              </Progress>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Recent Activity
        </h2>
        <div className="glass-card p-6">
          <div className="space-y-4">
            {[
              { action: 'Earned badge', detail: 'Dev Master', time: '2 hours ago', icon: Award },
              { action: 'Completed tutorial', detail: 'Creating a Pet System', time: '5 hours ago', icon: CheckCircle },
              { action: 'Leveled up', detail: 'Reached Level 42', time: '1 day ago', icon: Star }
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-slate-900/50 hover:bg-slate-800/50 transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-magenta-500 rounded-lg flex items-center justify-center">
                  <activity.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{activity.action}</p>
                  <p className="text-sm text-gray-400">{activity.detail}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
