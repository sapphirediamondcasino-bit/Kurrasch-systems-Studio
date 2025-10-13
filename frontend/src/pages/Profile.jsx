import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Calendar, MapPin, Link as LinkIcon, Award, Users, Star, MessageCircle, UserPlus, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import PostCard from '../components/PostCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Profile = ({ currentUser: loggedInUser }) => {
  const { id } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const [userRes, postsRes] = await Promise.all([
        axios.get(`${API}/users/${id}`),
        axios.get(`${API}/posts?userId=${id}`)
      ]);
      setUser(userRes.data);
      setUserPosts(postsRes.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="text-cyan-400">Loading profile...</div>
      </div>
    );
  }

  const isOwnProfile = user.id === loggedInUser.id;

  const badgeColors = {
    legendary: 'from-yellow-500 to-orange-500',
    epic: 'from-purple-500 to-magenta-500',
    rare: 'from-blue-500 to-cyan-500'
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover Image & Avatar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden mb-6"
      >
        <div className="relative">
          {/* Cover */}
          <div className="h-64 bg-gradient-to-br from-cyan-500/20 to-magenta-500/20 relative overflow-hidden">
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f14] to-transparent" />
          </div>

          {/* Avatar */}
          <div className="absolute -bottom-16 left-8">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-32 h-32 rounded-full border-4 border-[#0b0f14] glow-effect"
            />
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 pb-6 px-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold neon-text mb-1">{user.displayName}</h1>
              <p className="text-gray-400">@{user.username}</p>
            </div>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button className="bg-cyan-500 hover:bg-cyan-600 gap-2">
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={isFollowing ? 'bg-slate-700 hover:bg-slate-600' : 'bg-cyan-500 hover:bg-cyan-600'}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Bio */}
          <p className="text-gray-300 mb-4 max-w-2xl">{user.bio}</p>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mb-6">
            <div>
              <span className="text-2xl font-bold text-white">{user.friends}</span>
              <p className="text-sm text-gray-400">Friends</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-white">{user.followers}</span>
              <p className="text-sm text-gray-400">Followers</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-white">{user.following}</span>
              <p className="text-sm text-gray-400">Following</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-cyan-400 flex items-center gap-1">
                <Star className="w-5 h-5" />
                {user.level}
              </span>
              <p className="text-sm text-gray-400">Level</p>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Badges
            </h3>
            <div className="flex gap-2 flex-wrap">
              {user.badges.map((badge) => (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.1 }}
                  className={`glass-card px-3 py-2 flex items-center gap-2 bg-gradient-to-r ${badgeColors[badge.tier]}`}
                >
                  <Award className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">{badge.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="glass-card w-full justify-start mb-6 p-1">
          <TabsTrigger value="posts" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Posts ({userPosts.length})
          </TabsTrigger>
          <TabsTrigger value="games" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Games (2)
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {userPosts.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-gray-400">No posts yet</p>
            </div>
          ) : (
            userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </TabsContent>

        <TabsContent value="games" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-6 text-center text-gray-400">
            Games coming soon
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="glass-card p-6">
          <div className="text-center text-gray-400">
            Achievements coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
