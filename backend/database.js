require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        avatar TEXT,
        username VARCHAR(255) UNIQUE
      );
    `);

    // Create posts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT,
        userId INT,
        image TEXT,
        likes INT DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id)
      );
    `);

    // Check if users exist and seed
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (rows[0].count === 0) {
      await pool.query(`INSERT INTO users (name, avatar, username) VALUES ('Admin User', 'https://i.pravatar.cc/150?u=admin', 'admin')`);
      await pool.query(`INSERT INTO posts (content, userId, image) VALUES ('Welcome to the new premium social network! This features a sleek UI and smooth interactions. ✨', 1, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80')`);
    }
    console.log('Database connected and initialized.');
  } catch (error) {
    console.error('Database setup failed or waiting for RDS:', error.message);
  }
}

module.exports = { pool, setupDatabase };
