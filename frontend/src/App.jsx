import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Image as ImageIcon, Send, MoreHorizontal, Search, Bell, Menu } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import './index.css';

const API_URL = 'http://13.201.13.56/api';

function App() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/posts`);
      if(res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, image })
      });
      if(res.ok) {
        const newPost = await res.json();
        setPosts([newPost, ...posts]);
        setContent('');
        setImage('');
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleLike = async (id) => {
    try {
      const res = await fetch(`${API_URL}/posts/${id}/like`, { method: 'POST' });
      if(res.ok) {
        const { likes } = await res.json();
        setPosts(posts.map(post => post.id === id ? { ...post, likes } : post));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCommentSubmit = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    try {
      const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText })
      });
      if(res.ok) {
        const newComment = await res.json();
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return { ...post, comments: [...(post.comments || []), newComment] };
          }
          return post;
        }));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  return (
    <div className="facebook-app">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-left">
          <div className="fb-logo">f</div>
          <div className="search-bar">
            <Search size={18} />
            <input type="text" placeholder="Search Nova Connect" />
          </div>
        </div>
        
        <div className="nav-center">
          <div className="nav-icon active"><Menu size={24} /></div>
          <div className="nav-icon"><Bell size={24} /></div>
        </div>

        <div className="nav-right">
          <img src="https://i.pravatar.cc/150?u=admin" alt="Profile" className="avatar-sm" />
          <span className="username-nav">Admin</span>
        </div>
      </nav>

      <div className="main-layout">
        {/* MAIN FEED */}
        <main className="feed">
          {/* CREATE POST */}
          <div className="card create-post-card">
            <div className="create-post-top">
              <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="avatar" />
              <input 
                type="text" 
                placeholder="What's on your mind, Admin?" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePost()}
              />
            </div>
            {image && (
              <div className="image-preview">
                <img src={image} alt="Preview" />
                <button onClick={() => setImage('')}>×</button>
              </div>
            )}
            <div className="create-post-bottom">
              <button className="post-tool" onClick={() => {
                const url = prompt("Enter image URL:");
                if(url) setImage(url);
              }}>
                <ImageIcon size={22} color="#45bd62" />
                <span>Photo/video</span>
              </button>
              <button className="post-btn-primary" onClick={handlePost} disabled={!content.trim()}>
                Post
              </button>
            </div>
          </div>

          {/* POST LIST */}
          <div className="posts-container">
            {loading ? (
              <div className="loading-state">Loading your feed...</div>
            ) : posts.length === 0 ? (
              <div className="empty-state">No posts to show. Start the conversation!</div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="card post-card">
                  <div className="post-header">
                    <img src={post.userAvatar || `https://i.pravatar.cc/150?u=${post.userId}`} alt={post.userName} className="avatar" />
                    <div className="post-meta">
                      <div className="post-user-name">{post.userName || 'Anonymous'}</div>
                      <div className="post-time">
                        {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Just now'}
                      </div>
                    </div>
                    <button className="more-btn"><MoreHorizontal size={20} /></button>
                  </div>

                  <div className="post-body">
                    <p>{post.content}</p>
                    {post.image && <img src={post.image} alt="Post content" className="post-img" />}
                  </div>

                  <div className="post-stats">
                    <div className="stat-item">
                      <div className="like-icon-bg"><Heart size={12} fill="white" /></div>
                      <span>{post.likes || 0}</span>
                    </div>
                    <div className="stat-item">{post.comments?.length || 0} comments</div>
                  </div>

                  <div className="post-actions-row">
                    <button className={`action-btn ${post.likes > 0 ? 'active' : ''}`} onClick={() => handleLike(post.id)}>
                      <Heart size={20} />
                      <span>Like</span>
                    </button>
                    <button className="action-btn" onClick={() => toggleComments(post.id)}>
                      <MessageCircle size={20} />
                      <span>Comment</span>
                    </button>
                    <button className="action-btn">
                      <Share2 size={20} />
                      <span>Share</span>
                    </button>
                  </div>

                  {expandedComments[post.id] && (
                    <div className="comments-box">
                      {post.comments?.map(comment => (
                        <div key={comment.id} className="comment-item">
                          <img src={comment.userAvatar || `https://i.pravatar.cc/150?u=${comment.userId}`} alt={comment.userName} className="avatar-xs" />
                          <div className="comment-bubble">
                            <div className="comment-user">{comment.userName}</div>
                            <div className="comment-text">{comment.content}</div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="comment-input-area">
                        <img src="https://i.pravatar.cc/150?u=admin" alt="Me" className="avatar-xs" />
                        <div className="input-pill">
                          <input 
                            type="text" 
                            placeholder="Write a comment..." 
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({...commentInputs, [post.id]: e.target.value})}
                            onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                          />
                          <button onClick={() => handleCommentSubmit(post.id)}><Send size={16} /></button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
