const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Swipe left or right
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { targetUserId, direction } = req.body;

    if (!targetUserId || !['left', 'right'].includes(direction)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    if (targetUserId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot swipe on yourself' });
    }

    const swipeId = uuidv4();

    await db.query(
      'INSERT INTO swipes (id, user_id, target_user_id, direction) VALUES ($1, $2, $3, $4)',
      [swipeId, req.user.userId, targetUserId, direction]
    );

    // Check for mutual right swipes (match)
    if (direction === 'right') {
      const mutualSwipe = await db.query(
        'SELECT * FROM swipes WHERE user_id = $1 AND target_user_id = $2 AND direction = $3',
        [targetUserId, req.user.userId, 'right']
      );

      if (mutualSwipe.rows.length > 0) {
        // Create match
        const matchId = uuidv4();
        const user1Id = req.user.userId < targetUserId ? req.user.userId : targetUserId;
        const user2Id = req.user.userId < targetUserId ? targetUserId : req.user.userId;

        await db.query(
          'INSERT INTO matches (id, user_1_id, user_2_id) VALUES ($1, $2, $3)',
          [matchId, user1Id, user2Id]
        );

        return res.json({ matched: true, matchId });
      }
    }

    res.json({ matched: false });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Already swiped on this user' });
    }
    res.status(500).json({ error: 'Failed to process swipe' });
  }
});

// Get swipe stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const swipes = await db.query(
      'SELECT direction, COUNT(*) as count FROM swipes WHERE user_id = $1 GROUP BY direction',
      [req.user.userId]
    );

    const stats = {
      right: 0,
      left: 0
    };

    swipes.rows.forEach(row => {
      stats[row.direction] = parseInt(row.count);
    });

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch swipe stats' });
  }
});

module.exports = router;
