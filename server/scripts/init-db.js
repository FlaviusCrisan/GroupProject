const pool = require("../db");
async function initDb() {
  try {
    await pool.query("SELECT 1");

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
    throw err;
  }
}

initDb()
  .then(() => console.log("Database schema ready"))
  .catch(() => {
    console.error("Schema initialization failed");
    process.exitCode = 1;
  })
  .finally(() => pool.end());
