import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PostDetail = ({ currentUser: loggedInUser }) => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [commentList, setCommentList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${API}/posts/${id}`);
      setPost(response.data);
      setIsLiked(response.data.isLiked);
      setLikes(response.data.likes);
      setCommentList(response.data.comments || []);
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !post) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="text-cyan-400">Loading post...</div>
      </div>
    );
  }

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment = {
        id: `c${Date.now()}`,
        postId: post.id,
        userId: loggedInUser.id,
        author: loggedInUser,
        content: newComment,
        likes: 0,
        replies: [],
        createdAt: new Date().toISOString()
      };
      setCommentList([...commentList, comment]);
      setNewComment('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-6"
      >
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.userId}`}>
              <img
                src={post.author.avatar}
                alt={post.author.username}
                className="w-14 h-14 rounded-full border-2 border-cyan-500/50 hover:border-cyan-400 transition-colors cursor-pointer"
              />
            </Link>
            <div>
              <Link to={`/profile/${post.userId}`} className="hover:text-cyan-400 transition-colors">
                <p className="font-semibold text-white text-lg">{post.author.displayName}</p>
              </Link>
              <p className="text-sm text-gray-400">
                @{post.author.username} · {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-cyan-400">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Post Content */}
        <p className="text-white text-lg mb-6 leading-relaxed">{post.content}</p>

        {/* Post Media */}
        {post.media && post.media.length > 0 && (
          <div className="mb-6 rounded-lg overflow-hidden border-2 border-cyan-500/30">
            {post.media[0].type === 'image' && (
              <img
                src={post.media[0].url}
                alt="Post media"
                className="w-full h-auto object-cover"
              />
            )}
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center gap-6 pt-4 border-t-2 border-cyan-500/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`gap-2 ${isLiked ? 'text-magenta-400' : 'text-gray-400'} hover:text-magenta-400`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-magenta-400' : ''}`} />
            <span className="font-medium text-lg">{likes}</span>
          </Button>

          <Button variant="ghost" size="sm" className="gap-2 text-gray-400">
            <MessageCircle className="w-6 h-6" />
            <span className="font-medium text-lg">{commentList.length}</span>
          </Button>

          <Button variant="ghost" size="sm" className="gap-2 text-gray-400 hover:text-cyan-400">
            <Share2 className="w-6 h-6" />
            <span className="font-medium text-lg">{post.shares}</span>
          </Button>
        </div>
      </motion.div>

      {/* Add Comment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-6"
      >
        <form onSubmit={handleComment}>
          <div className="flex gap-3">
            <img
              src={loggedInUser.avatar}
              alt={loggedInUser.username}
              className="w-10 h-10 rounded-full border-2 border-cyan-500/50"
            />
            <div className="flex-1">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] bg-slate-900/50 border-cyan-500/30 focus:border-cyan-400 text-white resize-none mb-3"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
                >
                  <Send className="w-4 h-4" />
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Comments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-bold text-cyan-400 mb-4">Comments ({commentList.length})</h3>
        <div className="space-y-4">
          {commentList.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-gray-400">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            commentList.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="glass-card p-4"
              >
                <div className="flex gap-3">
                  <Link to={`/profile/${comment.userId}`}>
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.username}
                      className="w-10 h-10 rounded-full border-2 border-cyan-500/50 hover:border-cyan-400 transition-colors"
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link to={`/profile/${comment.userId}`} className="hover:text-cyan-400 transition-colors">
                        <span className="font-semibold text-white">{comment.author.displayName}</span>
                      </Link>
                      <span className="text-sm text-gray-400">
                        @{comment.author.username} · {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-2">{comment.content}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-magenta-400 gap-1 h-auto p-0">
                        <Heart className="w-4 h-4" />
                        {comment.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-cyan-400 gap-1 h-auto p-0">
                        <MessageCircle className="w-4 h-4" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PostDetail;
