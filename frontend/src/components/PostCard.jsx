import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const formatTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 hover:border-cyan-500/40 transition-all"
    >
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.userId}`}>
            <img
              src={post.author.avatar}
              alt={post.author.username}
              className="w-12 h-12 rounded-full border-2 border-cyan-500/50 hover:border-cyan-400 transition-colors cursor-pointer"
            />
          </Link>
          <div>
            <Link to={`/profile/${post.userId}`} className="hover:text-cyan-400 transition-colors">
              <p className="font-semibold text-white">{post.author.displayName}</p>
            </Link>
            <p className="text-sm text-gray-400">@{post.author.username} · {formatTime(post.createdAt)}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-cyan-400">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Post Content */}
      <Link to={`/posts/${post.id}`}>
        <p className="text-white mb-4 leading-relaxed">{post.content}</p>
      </Link>

      {/* Post Media */}
      {post.media && post.media.length > 0 && (
        <div className="mb-4 rounded-lg overflow-hidden border-2 border-cyan-500/30">
          {post.media[0].type === 'image' && (
            <img
              src={post.media[0].url}
              alt="Post media"
              className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(post.media[0].url, '_blank')}
            />
          )}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-3 border-t-2 border-cyan-500/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`gap-2 ${isLiked ? 'text-magenta-400' : 'text-gray-400'} hover:text-magenta-400`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-magenta-400' : ''}`} />
          <span className="font-medium">{likes}</span>
        </Button>

        <Link to={`/posts/${post.id}`}>
          <Button variant="ghost" size="sm" className="gap-2 text-gray-400 hover:text-cyan-400">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">{post.comments}</span>
          </Button>
        </Link>

        <Button variant="ghost" size="sm" className="gap-2 text-gray-400 hover:text-cyan-400">
          <Share2 className="w-5 h-5" />
          <span className="font-medium">{post.shares}</span>
        </Button>

        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-cyan-400">
          <Bookmark className="w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  );
};

export default PostCard;
