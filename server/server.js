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
        game_mode VARCHAR(50) DEFAULT '',
        skill_level VARCHAR(20) DEFAULT '',
        region VARCHAR(20) DEFAULT '',
        joined BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
  )
  .catch(err => console.error('Connection error', err.stack));

app.get('/api/posts', async (req, res) => {
  try {
    const { game, game_mode, skill_level, region } = req.query;
    let query = 'SELECT * FROM posts WHERE joined = FALSE';
    const params = [];
    let paramIndex = 1;

    if (game) {
      query += ` AND game = $${paramIndex}`;
      params.push(game);
      paramIndex++;
    }

    if (game_mode) {
      query += ` AND game_mode = $${paramIndex}`;
      params.push(game_mode);
      paramIndex++;
    }

    if (skill_level) {
      query += ` AND skill_level = $${paramIndex}`;
      params.push(skill_level);
      paramIndex++;
    }

    if (region) {
      query += ` AND region = $${paramIndex}`;
      params.push(region);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query('SELECT * FROM posts WHERE id = $1 LIMIT 1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/posts', requireAuth(), async (req, res) => {
  try {
    const { title, description, username, game, game_mode, skill_level, region } = req.body;
    if (!title || !username) {
      return res.status(400).json({ error: 'title and username are required' });
    }
    const result = await pool.query(
      'INSERT INTO posts (title, description, username, game, game_mode, skill_level, region) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description || '', username, game || '', game_mode || '', skill_level || '', region || '']
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

app.patch('/api/posts/:id/join', requireAuth(), async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query(
      'UPDATE posts SET joined = TRUE WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
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
