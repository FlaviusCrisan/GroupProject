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
  .then(() =>
    pool.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        from_clerk_id VARCHAR(100) NOT NULL,
        to_clerk_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(from_clerk_id, to_clerk_id)
      )
    `)
  )
  .then(() =>
    pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id VARCHAR(100) NOT NULL,
        receiver_id VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
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

    const safeMetadata = { ...user.publicMetadata };
    delete safeMetadata.socials;

    res.json({
      id: user.id,
      publicMetadata: safeMetadata
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

    const safeMetadata = { ...user.publicMetadata };
    // Do NOT send sensitive socials here; they are only for mutual matches via /socials
    delete safeMetadata.socials;

    res.json({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      publicMetadata: safeMetadata
    });
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: 'User not found' });
  }
});

// like another user (swipe right)
app.post('/api/likes', requireAuth(), async (req, res) => {
  try {
    const { userId: fromUserId } = getAuth(req);
    const { toUserId } = req.body;

    if (!toUserId) {
      return res.status(400).json({ error: 'toUserId is required' });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({ error: 'You cannot like yourself' });
    }

    await pool.query(
      `INSERT INTO likes (from_clerk_id, to_clerk_id) 
       VALUES ($1, $2) 
       ON CONFLICT (from_clerk_id, to_clerk_id) DO NOTHING`,
      [fromUserId, toUserId]
    );

    // check if it's a mutual match
    const matchCheck = await pool.query(
      `SELECT * FROM likes WHERE from_clerk_id = $1 AND to_clerk_id = $2`,
      [toUserId, fromUserId]
    );

    const isMatch = matchCheck.rows.length > 0;
    
    res.json({ isMatch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// get user socials (only works if there is a mutual match)
app.get('/api/users/:userId/socials', requireAuth(), async (req, res) => {
  try {
    const { userId: requesterId } = getAuth(req);
    const targetUserId = req.params.userId;

    if (requesterId === targetUserId) {
       // user wants to see their own socials
       const targetUser = await clerkClient.users.getUser(targetUserId);
       return res.json({ socials: targetUser.publicMetadata?.socials || {} });
    }

    // Check mutual like
    const matchCheck1 = await pool.query(
      `SELECT 1 FROM likes WHERE from_clerk_id = $1 AND to_clerk_id = $2`,
      [requesterId, targetUserId]
    );

    const matchCheck2 = await pool.query(
      `SELECT 1 FROM likes WHERE from_clerk_id = $1 AND to_clerk_id = $2`,
      [targetUserId, requesterId]
    );

    if (matchCheck1.rows.length > 0 && matchCheck2.rows.length > 0) {
      // It's a match, get the socials from clerk
      const targetUser = await clerkClient.users.getUser(targetUserId);
      res.json({ socials: targetUser.publicMetadata?.socials || {} });
    } else {
      res.status(403).json({ error: 'Forbidden. Socials are only visible for mutual matches.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// get conversation history with a matched user
app.get('/api/messages/:matchUserId', requireAuth(), async (req, res) => {
  try {
    const { userId: currentUserId } = getAuth(req);
    const { matchUserId } = req.params;

    // Verify mutual match first
    const matchCheck1 = await pool.query(
      `SELECT 1 FROM likes WHERE from_clerk_id = $1 AND to_clerk_id = $2`,
      [currentUserId, matchUserId]
    );
    const matchCheck2 = await pool.query(
      `SELECT 1 FROM likes WHERE from_clerk_id = $1 AND to_clerk_id = $2`,
      [matchUserId, currentUserId]
    );

    // if (matchCheck1.rows.length === 0 || matchCheck2.rows.length === 0) {
    //   return res.status(403).json({ error: 'You can only message mutually matched users' });
    // }

    const messages = await pool.query(
      `SELECT * FROM messages 
       WHERE (sender_id = $1 AND receiver_id = $2) 
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [currentUserId, matchUserId]
    );

    res.json(messages.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// send a chat message
app.post('/api/messages', requireAuth(), async (req, res) => {
  try {
    const { userId: senderId } = getAuth(req);
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ error: 'receiverId and content are required' });
    }

    // Verify mutual match first
    const matchCheck1 = await pool.query(
      `SELECT 1 FROM likes WHERE from_clerk_id = $1 AND to_clerk_id = $2`,
      [senderId, receiverId]
    );
    const matchCheck2 = await pool.query(
      `SELECT 1 FROM likes WHERE from_clerk_id = $1 AND to_clerk_id = $2`,
      [receiverId, senderId]
    );

    // if (matchCheck1.rows.length === 0 || matchCheck2.rows.length === 0) {
    //   return res.status(403).json({ error: 'You can only message mutually matched users' });
    // }

    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [senderId, receiverId, content]
    );

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
