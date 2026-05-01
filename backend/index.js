const express = require('express');
const cors = require('cors');
const { pool, setupDatabase } = require('./database.js');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

setupDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(console.error);

app.get('/api/posts', async (req, res) => {
  try {
    const [posts] = await pool.query(`
      SELECT posts.*, users.name as userName, users.avatar as userAvatar, users.username 
      FROM posts 
      JOIN users ON posts.userId = users.id 
      ORDER BY createdAt DESC
    `);
    
    // Fetch comments for all posts
    const [comments] = await pool.query(`
      SELECT comments.*, users.name as userName, users.avatar as userAvatar, users.username 
      FROM comments 
      JOIN users ON comments.userId = users.id 
      ORDER BY createdAt ASC
    `);

    // Group comments by post
    const postsWithComments = posts.map(post => {
      post.comments = comments.filter(c => c.postId === post.id);
      return post;
    });

    res.json(postsWithComments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { content, image } = req.body;
    const [result] = await pool.query(
      'INSERT INTO posts (content, userId, image) VALUES (?, ?, ?)',
      [content, 1, image || null]
    );
    
    const [newPost] = await pool.query(`
      SELECT posts.*, users.name as userName, users.avatar as userAvatar, users.username 
      FROM posts JOIN users ON posts.userId = users.id 
      WHERE posts.id = ?`, [result.insertId]);
      
    newPost[0].comments = [];
    res.status(201).json(newPost[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts/:id/like', async (req, res) => {
  try {
    await pool.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [req.params.id]);
    const [updatedPost] = await pool.query('SELECT likes FROM posts WHERE id = ?', [req.params.id]);
    if (updatedPost.length > 0) {
      res.json(updatedPost[0]);
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;
    const userId = 1; // Default to admin user for demo

    const [result] = await pool.query(
      'INSERT INTO comments (postId, userId, content) VALUES (?, ?, ?)',
      [postId, userId, content]
    );
    
    const [newComment] = await pool.query(`
      SELECT comments.*, users.name as userName, users.avatar as userAvatar, users.username 
      FROM comments JOIN users ON comments.userId = users.id 
      WHERE comments.id = ?`, [result.insertId]);
      
    res.status(201).json(newComment[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
