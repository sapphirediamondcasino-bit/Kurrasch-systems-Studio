import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import Games from './pages/Games';
import DevHub from './pages/DevHub';
import Dashboard from './pages/Dashboard';
import Movies from './pages/Movies';
import MovieSession from './pages/MovieSession';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ChatBox from './components/ChatBox';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppContent = () => {
  const { user } = useAuth();
  const [activeChatUsers, setActiveChatUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const openChat = (chatUser) => {
    if (!activeChatUsers.find(u => u.id === chatUser.id)) {
      setActiveChatUsers([...activeChatUsers, chatUser]);
    }
  };

  const closeChat = (userId) => {
    setActiveChatUsers(activeChatUsers.filter(u => u.id !== userId));
  };

  return (
    <div className="app-container min-h-screen bg-[#0b0f14] text-white">
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" replace />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        
        <Route path="/*" element={
          <ProtectedRoute>
            <>
              <Navbar currentUser={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
              
              <div className="flex pt-16">
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.div
                      initial={{ x: -300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -300, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 z-30"
                    >
                      <Sidebar currentUser={user} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                  <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex gap-6">
                      <div className="flex-1 min-w-0">
                        <Routes>
                          <Route path="/" element={<Home currentUser={user} />} />
                          <Route path="/discover" element={<Discover />} />
                          <Route path="/profile/:id" element={<Profile currentUser={user} />} />
                          <Route path="/posts/:id" element={<PostDetail currentUser={user} />} />
                          <Route path="/games" element={<Games />} />
                          <Route path="/devhub" element={<DevHub />} />
                          <Route path="/dashboard" element={<Dashboard currentUser={user} />} />
                          <Route path="/movies" element={<Movies />} />
                          <Route path="/movies/:id" element={<MovieSession />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </div>

                      <div className="hidden xl:block w-80">
                        <RightSidebar currentUser={user} onOpenChat={openChat} />
                      </div>
                    </div>
                  </div>
                </main>
              </div>

              {/* Chat boxes */}
              <div className="fixed bottom-0 right-4 flex gap-4 z-50">
                {activeChatUsers.map((chatUser, index) => (
                  <motion.div
                    key={chatUser.id}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    style={{ right: `${index * 320 + 16}px` }}
                    className="fixed bottom-0"
                  >
                    <ChatBox user={chatUser} onClose={() => closeChat(chatUser.id)} />
                  </motion.div>
                ))}
              </div>
            </>
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
