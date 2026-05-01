const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function setupDatabase() {
  const db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      avatar TEXT,
      username TEXT UNIQUE
    );
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      userId INTEGER,
      image TEXT,
      likes INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `);

  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    await db.run(`INSERT INTO users (name, avatar, username) VALUES ('Admin User', 'https://i.pravatar.cc/150?u=admin', 'admin')`);
    await db.run(`INSERT INTO posts (content, userId, image) VALUES ('Welcome to the new premium social network! This features a sleek UI and smooth interactions. ✨', 1, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80')`);
  }
  return db;
}

module.exports = { setupDatabase };
