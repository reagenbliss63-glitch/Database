const express = require('express');
const cors = require('cors');
const { setupDatabase } = require('./database.js');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

let db;
setupDatabase().then(database => {
  db = database;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(console.error);

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await db.all(`
      SELECT posts.*, users.name as userName, users.avatar as userAvatar, users.username 
      FROM posts 
      JOIN users ON posts.userId = users.id 
      ORDER BY createdAt DESC
    `);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { content, image } = req.body;
    const result = await db.run(
      'INSERT INTO posts (content, userId, image) VALUES (?, ?, ?)',
      [content, 1, image || null]
    );
    
    const newPost = await db.get(`
      SELECT posts.*, users.name as userName, users.avatar as userAvatar, users.username 
      FROM posts JOIN users ON posts.userId = users.id 
      WHERE posts.id = ?`, result.lastID);
      
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts/:id/like', async (req, res) => {
  try {
    await db.run('UPDATE posts SET likes = likes + 1 WHERE id = ?', req.params.id);
    const updatedPost = await db.get('SELECT likes FROM posts WHERE id = ?', req.params.id);
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
