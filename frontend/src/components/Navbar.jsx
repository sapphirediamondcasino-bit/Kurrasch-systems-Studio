import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  Menu, Search, Bell, MessageSquare, User, 
  LogOut, Settings, Zap, Home, Compass, 
  Gamepad2, Code, LayoutDashboard, Film
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Navbar = ({ currentUser, onToggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API}/notifications`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b-2 border-cyan-500/20">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
            >
              <Menu className="w-6 h-6" />
            </Button>
            
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="flex items-center gap-2"
              >
                <Zap className="w-8 h-8 text-cyan-400 group-hover:text-magenta-400 transition-colors" />
                <span className="text-2xl font-bold neon-text hidden sm:block">GKS</span>
              </motion.div>
            </Link>
          </div>

          {/* Center section - Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60" />
              <Input
                type="text"
                placeholder="Search games, users, posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 bg-slate-900/50 border-cyan-500/30 focus:border-cyan-400 text-white placeholder:text-gray-500"
              />
            </div>
          </form>

          {/* Right section - Navigation icons */}
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                <Home className="w-5 h-5" />
              </Button>
            </Link>
            
            <Link to="/discover">
              <Button variant="ghost" size="icon" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                <Compass className="w-5 h-5" />
              </Button>
            </Link>
            
            <Link to="/games">
              <Button variant="ghost" size="icon" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                <Gamepad2 className="w-5 h-5" />
              </Button>
            </Link>

            <Link to="/devhub">
              <Button variant="ghost" size="icon" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                <Code className="w-5 h-5" />
              </Button>
            </Link>

            <Link to="/movies">
              <Button variant="ghost" size="icon" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                <Film className="w-5 h-5" />
              </Button>
            </Link>

            <div className="w-px h-6 bg-cyan-500/20" />

            <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-magenta-500 text-white text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 glass-card border-cyan-500/30 bg-slate-900/95 text-white">
                <div className="p-2">
                  <h3 className="text-lg font-semibold mb-2 neon-text">Notifications</h3>
                  {notifications.length === 0 ? (
                    <p className="text-gray-400 text-sm py-4 text-center">No notifications</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-custom">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            notification.isRead ? 'bg-slate-800/50' : 'bg-cyan-500/10 border border-cyan-500/20'
                          } hover:bg-cyan-500/20`}
                        >
                          <div className="flex gap-3">
                            <img
                              src={notification.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                              alt={notification.user?.username || 'User'}
                              className="w-10 h-10 rounded-full border-2 border-cyan-500/30"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">
                                <span className="font-semibold text-cyan-400">{notification.user?.username || 'Someone'}</span>
                                {' '}{notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
              <MessageSquare className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                  <img
                    src={currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                    alt={currentUser?.username || 'User'}
                    className="w-8 h-8 rounded-full border-2 border-cyan-500/50 glow-effect"
                  />
                  <span className="hidden md:inline font-semibold">{currentUser?.displayName || currentUser?.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-card border-cyan-500/30 bg-slate-900/95 text-white">
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-cyan-500/20">
                  <Link to={`/profile/${currentUser?.id}`} className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-cyan-500/20">
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-cyan-500/20">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-cyan-500/20" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-magenta-500/20 text-magenta-400">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
