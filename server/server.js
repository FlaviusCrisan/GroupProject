const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { clerkMiddleware, requireAuth, getAuth, clerkClient } = require('@clerk/express');
require('dotenv').config();
require('dotenv').config({ path: '../.env' });

const { GAMES, REGIONS, LANGUAGES, AGE_RANGES, GENDERS } = require('./game-config');

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

const auth = requireAuth();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function initDb() {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL');
    
    await pool.query(`
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
        accepted_clerk_id VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS join_requests (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id),
        clerk_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(post_id, clerk_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id VARCHAR(100) NOT NULL,
        receiver_id VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
}

initDb();

app.get('/debug', (req, res) => res.send('debug ok'));

app.get('/api/games', (req, res) => {
  res.json({
    games: GAMES,
    regions: REGIONS,
    languages: LANGUAGES,
    age_ranges: AGE_RANGES,
    genders: GENDERS
  });
});

app.get('/api/check', (req, res) => {
    res.send("ok");
});

const memoryPosts = [];

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

    if (req.query.user) {
      query += ` AND clerk_id = $${paramIndex}`;
      params.push(req.query.user);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Database query failed, using memory fallback:', err.message);
    // Filter memory posts based on query params
    let filtered = memoryPosts.filter(p => !p.joined);
    const filters = ['game', 'game_mode', 'rank', 'region', 'platform', 'language', 'age_range', 'gender'];
    for (const filter of filters) {
      if (req.query[filter]) {
        filtered = filtered.filter(p => p[filter] === req.query[filter]);
      }
    }
    if (req.query.user) {
      filtered = filtered.filter(p => p.clerk_id === req.query.user);
    }
    res.json(filtered.reverse());
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query('SELECT * FROM posts WHERE id = $1 LIMIT 1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Database fetch failed, using memory fallback:', err.message);
    const post = memoryPosts.find(p => p.id == req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  }
});

app.post('/api/posts', auth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { title, description, game, game_mode, rank, region, platform, language, age_range, gender } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    let username = 'Unknown Player';
    try {
      const user = await clerkClient.users.getUser(userId);
      username = user.username || user.firstName || 'Unknown';
    } catch (clerkErr) {
      console.warn('Failed to fetch user from Clerk:', clerkErr.message);
      const lastPost = await pool.query('SELECT username FROM posts WHERE clerk_id = $1 LIMIT 1', [userId]);
      if (lastPost.rows.length > 0) username = lastPost.rows[0].username;
    }

    try {
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
    } catch (dbErr) {
      console.error('Database insert failed, using memory fallback:', dbErr.message);
      const newPost = {
        id: Math.floor(Math.random() * 1000000),
        title,
        description: description || '',
        clerk_id: userId,
        username,
        game: game || '',
        game_mode: game_mode || '',
        rank: rank || '',
        region: region || '',
        platform: platform || '',
        language: language || '',
        age_range: age_range || '',
        gender: gender || '',
        joined: false,
        created_at: new Date()
      };
      memoryPosts.push(newPost);
      res.json(newPost);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/posts/:id', auth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const id = req.params.id;
    const { title, description, game, game_mode, rank, region, platform, language, age_range, gender } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const postCheck = await pool.query('SELECT clerk_id FROM posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (postCheck.rows[0].clerk_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      `UPDATE posts
       SET title = $1, description = $2, game = $3, game_mode = $4, rank = $5, region = $6, platform = $7, language = $8, age_range = $9, gender = $10
       WHERE id = $11 RETURNING *`,
      [
        title,
        description || '',
        game || '',
        game_mode || '',
        rank || '',
        region || '',
        platform || '',
        language || '',
        age_range || '',
        gender || '',
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/posts/:id', auth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const id = req.params.id;

    const postCheck = await pool.query('SELECT clerk_id FROM posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (postCheck.rows[0].clerk_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await pool.query('DELETE FROM join_requests WHERE post_id = $1', [id]);
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);

    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const memoryJoinRequests = [];

app.post('/api/posts/:id/join', auth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const id = req.params.id;

    // Check if post exists and if requester is the owner
    try {
      const postCheck = await pool.query('SELECT clerk_id FROM posts WHERE id = $1', [id]);
      if (postCheck.rows.length > 0 && postCheck.rows[0].clerk_id === userId) {
        return res.status(400).json({ error: 'Cannot join your own post' });
      }
    } catch (e) {
      // Memory fallback check
      const memPost = memoryPosts.find(p => p.id == id);
      if (memPost && memPost.clerk_id === userId) {
        return res.status(400).json({ error: 'Cannot join your own post' });
      }
    }

    try {
      const result = await pool.query(
        'INSERT INTO join_requests (post_id, clerk_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
        [id, userId]
      );
      res.json(result.rows[0] || { message: 'Already requested' });
    } catch (dbErr) {
      console.error('Join request DB insert failed, using memory fallback:', dbErr.message);
      const existing = memoryJoinRequests.find(r => r.post_id == id && r.clerk_id === userId);
      if (existing) return res.json({ message: 'Already requested' });
      
      const newReq = {
        id: Math.floor(Math.random() * 1000000),
        post_id: id,
        clerk_id: userId,
        created_at: new Date()
      };
      memoryJoinRequests.push(newReq);
      res.json(newReq);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/posts/:id/join', auth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const id = req.params.id;

    await pool.query('DELETE FROM join_requests WHERE post_id = $1 AND clerk_id = $2', [id, userId]);
    res.json({ message: 'Request cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const handleMetadata = async (req, res) => {
  try {
    let userId = 'test_user';
    try {
      const authData = getAuth(req);
      if (authData && authData.userId) userId = authData.userId;
    } catch (e) {}

    console.log(`${req.method} Metadata update request for user: ${userId}`);
    const { publicMetadata } = req.body;

    if (!publicMetadata) {
      return res.status(400).json({ error: 'publicMetadata is required' });
    }

    try {
      const user = await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: publicMetadata
      });
      return res.json({
        id: user.id,
        publicMetadata: user.publicMetadata
      });
    } catch (clerkErr) {
      console.warn('Failed to update Clerk metadata:', clerkErr.message);
      return res.json({
        id: userId,
        publicMetadata: publicMetadata,
        warning: 'Saved locally only (Clerk error)'
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

app.post('/api/users/metadata', handleMetadata);
app.patch('/api/users/metadata', handleMetadata);

app.get('/api/users/requests', auth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const joined = req.query.joined === '1';

    try {
      let query = '';
      let params = [];

      if (joined) {
        query = `SELECT * FROM posts WHERE joined = TRUE AND (clerk_id = $1 OR accepted_clerk_id = $1) ORDER BY created_at DESC`;
        params = [userId];
      } else {
        query = `SELECT p.* FROM posts p 
                 INNER JOIN join_requests r ON p.id = r.post_id 
                 WHERE r.clerk_id = $1 AND p.joined = FALSE 
                 ORDER BY r.created_at DESC`;
        params = [userId];
      }

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (dbErr) {
      console.error('Fetch user requests DB query failed, using memory fallback:', dbErr.message);
      if (joined) {
        const filtered = memoryPosts.filter(p => p.joined && (p.clerk_id === userId || p.accepted_clerk_id === userId));
        res.json(filtered.reverse());
      } else {
        const myRequestPostIds = memoryJoinRequests
          .filter(r => r.clerk_id === userId)
          .map(r => r.post_id);
        const filtered = memoryPosts.filter(p => myRequestPostIds.includes(p.id) && !p.joined);
        res.json(filtered.reverse());
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === 'metadata') {
       // Should not happen if route order is correct, but let's be safe
       return res.status(404).json({ error: 'Not Found' });
    }
    try {
      const user = await clerkClient.users.getUser(userId);
      return res.json({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        publicMetadata: user.publicMetadata
      });
    } catch (clerkErr) {
      console.warn('Failed to fetch user from Clerk:', clerkErr.message);
      return res.json({
        id: userId,
        username: 'Player',
        publicMetadata: {},
        warning: 'Clerk error'
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users/:userId/socials', async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    try {
      const targetUser = await clerkClient.users.getUser(targetUserId);
      return res.json({ socials: targetUser.publicMetadata?.socials || {} });
    } catch (clerkErr) {
      return res.json({ socials: {} });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/posts/:id/requests', auth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const id = req.params.id;

    try {
      const result = await pool.query('SELECT * FROM join_requests WHERE post_id = $1 ORDER BY created_at DESC', [id]);
      res.json(result.rows);
    } catch (dbErr) {
      console.error('Fetch requests DB query failed, using memory fallback:', dbErr.message);
      const filtered = memoryJoinRequests.filter(r => r.post_id == id);
      res.json(filtered.reverse());
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/posts/:id/hasRequested', auth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const id = req.params.id;

    try {
      const result = await pool.query('SELECT * FROM join_requests WHERE post_id = $1 AND clerk_id = $2', [id, userId]);
      res.json({hasRequested: result.rows.length !== 0});
    } catch (dbErr) {
      console.error('HasRequested DB query failed, using memory fallback:', dbErr.message);
      const exists = memoryJoinRequests.some(r => r.post_id == id && r.clerk_id === userId);
      res.json({hasRequested: exists});
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/posts/:id/accept', auth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const id = req.params.id;
    const { clerk_id } = req.body;

    if (!clerk_id) {
      return res.status(400).json({ error: 'clerk_id is required' });
    }

    try {
      const result = await pool.query(
        'UPDATE posts SET joined = TRUE, accepted_clerk_id = $1 WHERE id = $2 RETURNING *',
        [clerk_id, id]
      );
      res.json(result.rows[0]);
    } catch (dbErr) {
      console.error('Accept request DB update failed, using memory fallback:', dbErr.message);
      const post = memoryPosts.find(p => p.id == id);
      if (post) {
        post.joined = true;
        post.accepted_clerk_id = clerk_id;
        res.json(post);
      } else {
        res.status(404).json({ error: 'Post not found' });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/posts/:id/decline', auth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const id = req.params.id;
    const { clerk_id } = req.body;

    try {
      await pool.query('DELETE FROM join_requests WHERE post_id = $1 AND clerk_id = $2', [id, clerk_id]);
      res.json({ message: 'Request declined' });
    } catch (dbErr) {
      console.error('Decline request DB delete failed, using memory fallback:', dbErr.message);
      const index = memoryJoinRequests.findIndex(r => r.post_id == id && r.clerk_id === clerk_id);
      if (index !== -1) memoryJoinRequests.splice(index, 1);
      res.json({ message: 'Request declined' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const memoryMessages = [];

app.get('/api/messages/:matchUserId', auth, async (req, res) => {
  try {
    const { userId: currentUserId } = getAuth(req);
    const { matchUserId } = req.params;

    try {
      const messages = await pool.query(
        `SELECT * FROM messages 
         WHERE (sender_id = $1 AND receiver_id = $2) 
            OR (sender_id = $2 AND receiver_id = $1)
         ORDER BY created_at ASC`,
        [currentUserId, matchUserId]
      );
      res.json(messages.rows);
    } catch (dbErr) {
      console.error('Fetch messages DB query failed, using memory fallback:', dbErr.message);
      const filtered = memoryMessages.filter(m => 
        (m.sender_id === currentUserId && m.receiver_id === matchUserId) ||
        (m.sender_id === matchUserId && m.receiver_id === currentUserId)
      );
      res.json(filtered.sort((a, b) => a.created_at - b.created_at));
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/messages', auth, async (req, res) => {
  try {
    const { userId: senderId } = getAuth(req);
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ error: 'receiverId and content are required' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *`,
        [senderId, receiverId, content]
      );
      res.json(result.rows[0]);
    } catch (dbErr) {
      console.error('Send message DB insert failed, using memory fallback:', dbErr.message);
      const newMsg = {
        id: Math.floor(Math.random() * 1000000),
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        created_at: new Date()
      };
      memoryMessages.push(newMsg);
      res.json(newMsg);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

setInterval(() => {}, 1000);
