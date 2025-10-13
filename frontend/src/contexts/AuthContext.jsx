import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API}/users/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      
      // Demo mode - try to load from localStorage
      const demoUsers = JSON.parse(localStorage.getItem('demo_users') || '[]');
      if (demoUsers.length > 0 && token && token.startsWith('demo_token_')) {
        // Get the last created user (most recent login)
        setUser(demoUsers[demoUsers.length - 1]);
        setLoading(false);
        return;
      }
      
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { success: true };
    } catch (error) {
      // Demo mode - check localStorage for existing user
      const demoUsers = JSON.parse(localStorage.getItem('demo_users') || '[]');
      const demoUser = demoUsers.find(u => u.email === email && u.password === password);
      
      if (demoUser) {
        const token = 'demo_token_' + Date.now();
        localStorage.setItem('token', token);
        setToken(token);
        setUser(demoUser);
        return { success: true };
      }
      
      return { success: false, error: 'Invalid credentials. Try signing up first!' };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post(`${API}/auth/signup`, userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { success: true };
    } catch (error) {
      // Demo mode - create user in localStorage
      const demoUsers = JSON.parse(localStorage.getItem('demo_users') || '[]');
      
      // Check if email already exists
      if (demoUsers.find(u => u.email === userData.email)) {
        return { success: false, error: 'Email already exists' };
      }
      
      // Create new demo user
      const newUser = {
        id: 'demo_' + Date.now(),
        username: userData.username,
        email: userData.email,
        password: userData.password,
        displayName: userData.username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
        coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=400&fit=crop',
        bio: 'Welcome to Game Killers Studio!',
        level: 1,
        xp: 0,
        xpToNextLevel: 1000,
        subscriptionTier: 'free',
        aiCredits: 100,
        adCredits: 0,
        badges: [],
        followers: 0,
        following: 0,
        friends: 0,
        isFounder: userData.email === 'tannerkurrach@gmail.com',
        isAdmin: userData.email === 'tannerkurrach@gmail.com' || userData.email === 'gamekillerszone@gmail.com',
        hasOrgBadge: userData.email === 'tannerkurrach@gmail.com' || userData.email === 'gamekillerszone@gmail.com',
        createdAt: new Date().toISOString()
      };
      
      // Auto-grant founder badges
      if (newUser.isFounder) {
        newUser.badges = [
          { id: 'founder', name: 'Founder', icon: 'star', tier: 'legendary' },
          { id: 'admin', name: 'Admin', icon: 'shield', tier: 'legendary' },
          { id: 'org', name: 'Verified', icon: 'check', tier: 'epic' }
        ];
        newUser.subscriptionTier = 'gks_elite';
        newUser.aiCredits = -1; // Unlimited
        newUser.adCredits = 5000;
      } else if (newUser.isAdmin) {
        newUser.badges = [
          { id: 'founding_group', name: 'Founding Group', icon: 'users', tier: 'legendary' },
          { id: 'org', name: 'Verified', icon: 'check', tier: 'epic' }
        ];
        newUser.subscriptionTier = 'gks_elite';
        newUser.aiCredits = -1; // Unlimited
        newUser.adCredits = 5000;
      }
      
      demoUsers.push(newUser);
      localStorage.setItem('demo_users', JSON.stringify(demoUsers));
      
      const token = 'demo_token_' + Date.now();
      localStorage.setItem('token', token);
      setToken(token);
      setUser(newUser);
      
      return { success: true };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
