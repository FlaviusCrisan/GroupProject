const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { clerkMiddleware, requireAuth, getAuth, clerkClient } = require('@clerk/express');
require('dotenv').config();

const { GAMES, REGIONS, LANGUAGES, AGE_RANGES, GENDERS } = require('./game-config');

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
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT DEFAULT '',
        clerk_id VARCHAR(100) NOT NULL,
        username VARCHAR(50) NOT NULL,
        game VARCHAR(50) DEFAULT '',
        game_mode VARCHAR(50) DEFAULT '',
        rank VARCHAR(40) DEFAULT '',
        region VARCHAR(20) DEFAULT '',
        platform VARCHAR(30) DEFAULT '',
        language VARCHAR(30) DEFAULT '',
        age_range VARCHAR(20) DEFAULT '',
        gender VARCHAR(30) DEFAULT '',
        joined BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
  )
  .catch(err => console.error('Connection error', err.stack));

// get all supported games and their filter options
app.get('/api/games', (req, res) => {
  res.json({
    games: GAMES,
    regions: REGIONS,
    languages: LANGUAGES,
    age_ranges: AGE_RANGES,
    genders: GENDERS
  });
});

// get posts with optional filters
app.get('/api/posts', async (req, res) => {
  try {
    const filters = ['game', 'game_mode', 'rank', 'region', 'platform', 'language', 'age_range', 'gender'];
    let query = 'SELECT * FROM posts WHERE joined = FALSE';
    const params = [];
    let paramIndex = 1;

    for (const filter of filters) {
      if (req.query[filter]) {
        query += ` AND ${filter} = $${paramIndex}`;
        params.push(req.query[filter]);
        paramIndex++;
      }
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// get single post by id
app.get('/api/posts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query('SELECT * FROM posts WHERE id = $1 LIMIT 1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// create a new post (auth required)
app.post('/api/posts', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { title, description, game, game_mode, rank, region, platform, language, age_range, gender } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    // get username from clerk
    const user = await clerkClient.users.getUser(userId);
    const username = user.username || user.firstName || 'Unknown';

    const result = await pool.query(
      `INSERT INTO posts (title, description, clerk_id, username, game, game_mode, rank, region, platform, language, age_range, gender)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        title,
        description || '',
        userId,
        username,
        game || '',
        game_mode || '',
        rank || '',
        region || '',
        platform || '',
        language || '',
        age_range || '',
        gender || ''
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// join a post (auth required)
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

// update user metadata in clerk (auth required)
app.patch('/api/users/metadata', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { publicMetadata } = req.body;

    if (!publicMetadata) {
      return res.status(400).json({ error: 'publicMetadata is required' });
    }

    const user = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: publicMetadata
    });

    res.json({
      id: user.id,
      publicMetadata: user.publicMetadata
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// get user info from clerk by their id
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await clerkClient.users.getUser(userId);
    res.json({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      publicMetadata: user.publicMetadata
    });
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: 'User not found' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
