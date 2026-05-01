import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import './index.css';

const API_URL = 'http://13.201.13.56/api';

function App() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');

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

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">Nova Connect</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="https://i.pravatar.cc/150?u=admin" alt="Profile" className="avatar" style={{width: 36, height: 36}}/>
        </div>
      </header>

      <main>
        <div className="create-post">
          <textarea 
            className="post-input" 
            placeholder="What's on your mind, Admin?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {image && (
            <img src={image} alt="Preview" className="post-image" style={{maxHeight: 200, marginBottom: '1rem'}} />
          )}
          <div className="post-actions">
            <button 
              className="action-btn"
              style={{ flex: 0 }}
              onClick={() => {
                const url = prompt("Enter image URL (optional):");
                if (url) setImage(url);
              }}
            >
              <ImageIcon size={20} /> Photo
            </button>
            <button className="btn" onClick={handlePost}>Post</button>
          </div>
        </div>

        <div className="post-list">
          {posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <img src={post.userAvatar} alt={post.userName} className="avatar" />
                <div className="user-info">
                  <span className="user-name">{post.userName}</span>
                  <span className="user-handle">
                    @{post.username} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              <div className="post-content">
                {post.content}
              </div>

              {post.image && (
                <img src={post.image} alt="Post attachment" className="post-image" />
              )}

              <div className="post-footer">
                <button 
                  className={`action-btn ${post.likes > 0 ? 'liked' : ''}`} 
                  onClick={() => handleLike(post.id)}
                >
                  <Heart size={20} />
                  {post.likes}
                </button>
                <button className="action-btn">
                  <MessageCircle size={20} />
                  Comment
                </button>
                <button className="action-btn">
                  <Share2 size={20} />
                  Share
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem'}}>
              No posts yet. Be the first to share something!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
