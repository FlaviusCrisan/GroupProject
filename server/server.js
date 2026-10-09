const express = require("express");
const cors = require("cors");
const { clerkMiddleware, getAuth, clerkClient } = require("@clerk/express");
require("dotenv").config({ quiet: true });
require("dotenv").config({ path: "../.env", quiet: true });

const {
  GAMES,
  REGIONS,
  LANGUAGES,
  AGE_RANGES,
  GENDERS,
} = require("./game-config");

const app = express();

app.use(cors());
app.use(express.json({ limit: "32kb" }));
app.use(clerkMiddleware());

const auth = (req, res, next) => {
  if (!getAuth(req).userId)
    return res.status(401).json({ error: "Sign in required" });
  next();
};

const pool = require("./db");

app.get("/debug", (req, res) => res.send("debug ok"));

app.get("/api/games", (req, res) => {
  res.json({
    games: GAMES,
    regions: REGIONS,
    languages: LANGUAGES,
    age_ranges: AGE_RANGES,
    genders: GENDERS,
  });
});

app.get("/api/check", (req, res) => {
  res.send("ok");
});

app.get("/api/posts", async (req, res) => {
  try {
    const filters = [
      "game",
      "game_mode",
      "rank",
      "region",
      "platform",
      "language",
      "age_range",
      "gender",
    ];
    let query = "SELECT * FROM posts WHERE joined = FALSE";
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

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    return res
      .status(503)
      .json({ error: "Database unavailable. Please try again." });
  }
});

app.get("/api/posts/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query(
      "SELECT * FROM posts WHERE id = $1 LIMIT 1",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    return res
      .status(503)
      .json({ error: "Database unavailable. Please try again." });
  }
});

app.post("/api/posts", auth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const {
      title,
      description,
      game,
      game_mode,
      rank,
      region,
      platform,
      language,
      age_range,
      gender,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    let username = "Unknown Player";
    try {
      const user = await clerkClient.users.getUser(userId);
      username = user.username || user.firstName || "Unknown";
    } catch (clerkErr) {
      console.warn("Failed to fetch user from Clerk:", clerkErr.message);
      const lastPost = await pool.query(
        "SELECT username FROM posts WHERE clerk_id = $1 LIMIT 1",
        [userId],
      );
      if (lastPost.rows.length > 0) username = lastPost.rows[0].username;
    }

    try {
      const result = await pool.query(
        `INSERT INTO posts (title, description, clerk_id, username, game, game_mode, rank, region, platform, language, age_range, gender)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [
          title,
          description || "",
          userId,
          username,
          game || "",
          game_mode || "",
          rank || "",
          region || "",
          platform || "",
          language || "",
          age_range || "",
          gender || "",
        ],
      );
      res.json(result.rows[0]);
    } catch (dbErr) {
      return res
        .status(503)
        .json({ error: "Database unavailable. Please try again." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.patch("/api/posts/:id", auth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const id = req.params.id;
    const {
      title,
      description,
      game,
      game_mode,
      rank,
      region,
      platform,
      language,
      age_range,
      gender,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    const postCheck = await pool.query(
      "SELECT clerk_id FROM posts WHERE id = $1",
      [id],
    );
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (postCheck.rows[0].clerk_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const result = await pool.query(
      `UPDATE posts
       SET title = $1, description = $2, game = $3, game_mode = $4, rank = $5, region = $6, platform = $7, language = $8, age_range = $9, gender = $10
       WHERE id = $11 RETURNING *`,
      [
        title,
        description || "",
        game || "",
        game_mode || "",
        rank || "",
        region || "",
        platform || "",
        language || "",
        age_range || "",
        gender || "",
        id,
      ],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/posts/:id", auth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const id = req.params.id;

    const postCheck = await pool.query(
      "SELECT clerk_id FROM posts WHERE id = $1",
      [id],
    );
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (postCheck.rows[0].clerk_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await pool.query("DELETE FROM join_requests WHERE post_id = $1", [id]);
    await pool.query("DELETE FROM posts WHERE id = $1", [id]);

    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/posts/:id/join", auth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const id = req.params.id;

    // Check if post exists and if requester is the owner
    try {
      const postCheck = await pool.query(
        "SELECT clerk_id, joined FROM posts WHERE id = $1",
        [id],
      );
      if (!postCheck.rows.length)
        return res.status(404).json({ error: "Post not found" });
      if (postCheck.rows[0].joined)
        return res.status(409).json({ error: "Lobby is full" });
      if (postCheck.rows.length > 0 && postCheck.rows[0].clerk_id === userId) {
        return res.status(400).json({ error: "Cannot join your own post" });
      }
    } catch (e) {
      return res
        .status(503)
        .json({ error: "Database unavailable. Please try again." });
    }

    try {
      const result = await pool.query(
        "INSERT INTO join_requests (post_id, clerk_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *",
        [id, userId],
      );
      res.json(result.rows[0] || { message: "Already requested" });
    } catch (dbErr) {
      return res
        .status(503)
        .json({ error: "Database unavailable. Please try again." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/posts/:id/join", auth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const id = req.params.id;

    await pool.query(
      "DELETE FROM join_requests WHERE post_id = $1 AND clerk_id = $2",
      [id, userId],
    );
    res.json({ message: "Request cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const handleMetadata = async (req, res) => {
  const { userId } = getAuth(req);
  const { publicMetadata } = req.body;
  if (
    !publicMetadata ||
    typeof publicMetadata !== "object" ||
    Array.isArray(publicMetadata)
  ) {
    return res.status(400).json({ error: "publicMetadata must be an object" });
  }
  try {
    const user = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata,
    });
    res.json({ id: user.id, publicMetadata: user.publicMetadata });
  } catch {
    res.status(502).json({ error: "Preferences could not be saved" });
  }
};
app.post("/api/users/metadata", auth, handleMetadata);
app.patch("/api/users/metadata", auth, handleMetadata);

const requirePostOwner = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT clerk_id FROM posts WHERE id = $1",
      [req.params.id],
    );
    if (!result.rows.length)
      return res.status(404).json({ error: "Post not found" });
    if (result.rows[0].clerk_id !== getAuth(req).userId)
      return res
        .status(403)
        .json({ error: "Only the host can manage requests" });
    next();
  } catch {
    res.status(503).json({ error: "Database unavailable. Please try again." });
  }
};

app.get("/api/users/requests", auth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const joined = req.query.joined === "1";

    try {
      let query = "";
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
      return res
        .status(503)
        .json({ error: "Database unavailable. Please try again." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === "metadata") {
      // Should not happen if route order is correct, but let's be safe
      return res.status(404).json({ error: "Not Found" });
    }
    try {
      const user = await clerkClient.users.getUser(userId);
      return res.json({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        publicMetadata: user.publicMetadata,
      });
    } catch (clerkErr) {
      console.warn("Failed to fetch user from Clerk:", clerkErr.message);
      return res.json({
        id: userId,
        username: "Player",
        publicMetadata: {},
        warning: "Clerk error",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/users/:userId/socials", async (req, res) => {
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
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/posts/:id/requests", auth, requirePostOwner, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const id = req.params.id;

    try {
      const result = await pool.query(
        "SELECT * FROM join_requests WHERE post_id = $1 ORDER BY created_at DESC",
        [id],
      );
      res.json(result.rows);
    } catch (dbErr) {
      return res
        .status(503)
        .json({ error: "Database unavailable. Please try again." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/posts/:id/hasRequested", auth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const id = req.params.id;

    try {
      const result = await pool.query(
        "SELECT * FROM join_requests WHERE post_id = $1 AND clerk_id = $2",
        [id, userId],
      );
      res.json({ hasRequested: result.rows.length !== 0 });
    } catch (dbErr) {
      return res
        .status(503)
        .json({ error: "Database unavailable. Please try again." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/posts/:id/accept", auth, requirePostOwner, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const id = req.params.id;
    const { clerk_id } = req.body;

    if (!clerk_id) {
      return res.status(400).json({ error: "clerk_id is required" });
    }

    try {
      const result = await pool.query(
        `UPDATE posts SET joined = TRUE, accepted_clerk_id = $1
         WHERE id = $2 AND clerk_id = $3 AND joined = FALSE
         AND EXISTS (SELECT 1 FROM join_requests WHERE post_id = $2 AND clerk_id = $1) RETURNING *`,
        [clerk_id, id, userId],
      );
      if (!result.rows.length)
        return res
          .status(409)
          .json({
            error: "Lobby is full or this player has not requested to join",
          });
      res.json(result.rows[0]);
    } catch (dbErr) {
      return res
        .status(503)
        .json({ error: "Database unavailable. Please try again." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/posts/:id/decline", auth, requirePostOwner, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const id = req.params.id;
    const { clerk_id } = req.body;

    try {
      await pool.query(
        "DELETE FROM join_requests WHERE post_id = $1 AND clerk_id = $2",
        [id, clerk_id],
      );
      res.json({ message: "Request declined" });
    } catch (dbErr) {
      return res
        .status(503)
        .json({ error: "Database unavailable. Please try again." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/messages/:matchUserId", auth, async (req, res) => {
  try {
    const { userId: currentUserId } = getAuth(req);
    const { matchUserId } = req.params;

    try {
      const messages = await pool.query(
        `SELECT * FROM messages 
         WHERE (sender_id = $1 AND receiver_id = $2) 
            OR (sender_id = $2 AND receiver_id = $1)
         ORDER BY created_at ASC`,
        [currentUserId, matchUserId],
      );
      res.json(messages.rows);
    } catch (dbErr) {
      return res
        .status(503)
        .json({ error: "Database unavailable. Please try again." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/messages", auth, async (req, res) => {
  try {
    const { userId: senderId } = getAuth(req);
    const { receiverId, content } = req.body;

    if (
      typeof receiverId !== "string" ||
      typeof content !== "string" ||
      !content.trim() ||
      content.length > 4000
    ) {
      return res
        .status(400)
        .json({ error: "receiverId and content are required" });
    }

    try {
      const result = await pool.query(
        `INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *`,
        [senderId, receiverId, content],
      );
      res.json(result.rows[0]);
    } catch (dbErr) {
      return res
        .status(503)
        .json({ error: "Database unavailable. Please try again." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = app;
if (require.main === module) {
  app.listen(process.env.PORT || 3000, () =>
    console.log("GameMatch API ready"),
  );
}
