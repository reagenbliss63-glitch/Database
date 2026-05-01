import { useState, useEffect } from 'react'

const API_URL = 'http://13.201.13.56/api';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/posts`)
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching posts:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#1877F2', borderBottom: '2px solid #1877F2', paddingBottom: '10px' }}>
        My Social Feed
      </h1>
      
      {loading ? (
        <p>Loading your feed from EC2...</p>
      ) : posts.length === 0 ? (
        <div style={{ background: '#f0f2f5', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <p>No posts found in the RDS Database yet!</p>
        </div>
      ) : (
        posts.map((post, index) => (
          <div key={index} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>User #{post.user_id || 'Anonymous'}</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>{post.content || post.text || "Hello world from the database!"}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default App
