const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get user's matches
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT m.id as match_id, 
              CASE 
                WHEN m.user_1_id = $1 THEN u2.id
                ELSE u1.id
              END as user_id,
              CASE 
                WHEN m.user_1_id = $1 THEN u2.username
                ELSE u1.username
              END as username,
              CASE 
                WHEN m.user_1_id = $1 THEN u2.first_name
                ELSE u1.first_name
              END as first_name,
              CASE 
                WHEN m.user_1_id = $1 THEN u2.photos
                ELSE u1.photos
              END as photos,
              m.created_at
       FROM matches m
       JOIN users u1 ON m.user_1_id = u1.id
       JOIN users u2 ON m.user_2_id = u2.id
       WHERE m.user_1_id = $1 OR m.user_2_id = $1
       ORDER BY m.created_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Get specific match
router.get('/:matchId', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM matches WHERE id = $1 AND (user_1_id = $2 OR user_2_id = $2)`,
      [req.params.matchId, req.user.userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch match' });
  }
});

module.exports = router;
