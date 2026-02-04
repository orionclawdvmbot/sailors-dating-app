const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Send message
router.post('/:matchId/messages', authMiddleware, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content required' });
    }

    // Verify user is part of the match
    const match = await db.query(
      'SELECT * FROM matches WHERE id = $1 AND (user_1_id = $2 OR user_2_id = $2)',
      [matchId, req.user.userId]
    );

    if (!match.rows[0]) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messageId = uuidv4();

    await db.query(
      'INSERT INTO messages (id, match_id, sender_id, content) VALUES ($1, $2, $3, $4)',
      [messageId, matchId, req.user.userId, content]
    );

    res.status(201).json({
      id: messageId,
      matchId,
      senderId: req.user.userId,
      content,
      createdAt: new Date()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get messages for a match
router.get('/:matchId/messages', authMiddleware, async (req, res) => {
  try {
    const { matchId } = req.params;
    const page = parseInt(req.query.page) || 0;
    const limit = 50;
    const offset = page * limit;

    // Verify user is part of the match
    const match = await db.query(
      'SELECT * FROM matches WHERE id = $1 AND (user_1_id = $2 OR user_2_id = $2)',
      [matchId, req.user.userId]
    );

    if (!match.rows[0]) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      `SELECT id, match_id, sender_id, content, created_at
       FROM messages
       WHERE match_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [matchId, limit, offset]
    );

    res.json(result.rows.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;
