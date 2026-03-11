const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { clerkMiddleware, requireAuth } = require('@clerk/express');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .then(() =>
    pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        clerk_id VARCHAR(100) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        bio TEXT DEFAULT '',
        favorite_games TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
  )
  .then(() =>
    pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT DEFAULT '',
        username VARCHAR(50) NOT NULL,
        game VARCHAR(50) DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
  )
  .catch(err => console.error('Connection error', err.stack));

app.get('/api/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/posts', requireAuth(), async (req, res) => {
  try {
    const { title, description, username, game } = req.body;
    if (!title || !username) {
      return res.status(400).json({ error: 'title and username are required' });
    }
    const result = await pool.query(
      'INSERT INTO posts (title, description, username, game) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description || '', username, game || '']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { clerkId, username } = req.body;
    if (!clerkId || !username) {
      return res.status(400).json({ error: 'clerkId and username are required' });
    }
    const existing = await pool.query('SELECT * FROM users WHERE clerk_id = $1', [clerkId]);
    if (existing.rows.length > 0) {
      return res.json(existing.rows[0]);
    }
    const result = await pool.query(
      'INSERT INTO users (clerk_id, username) VALUES ($1, $2) RETURNING *',
      [clerkId, username]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE clerk_id = $1', [clerkId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
