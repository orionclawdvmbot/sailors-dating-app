const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Setup multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/photos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, username, first_name, last_name, bio, age, location, sailing_level, boat_type, photos, created_at FROM users WHERE id = $1',
      [req.params.userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, bio, age, location, sailingLevel, boatType } = req.body;

    await db.query(
      `UPDATE users SET first_name = $1, last_name = $2, bio = $3, age = $4, location = $5, sailing_level = $6, boat_type = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8`,
      [firstName, lastName, bio, age, location, sailingLevel, boatType, req.user.userId]
    );

    const result = await db.query(
      'SELECT id, username, first_name, last_name, bio, age, location, sailing_level, boat_type, photos FROM users WHERE id = $1',
      [req.user.userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload photo
router.post('/upload-photo', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const photoUrl = `/uploads/photos/${req.file.filename}`;

    const result = await db.query(
      'SELECT photos FROM users WHERE id = $1',
      [req.user.userId]
    );

    let photos = result.rows[0]?.photos || [];
    photos.push(photoUrl);

    await db.query(
      'UPDATE users SET photos = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [photos, req.user.userId]
    );

    res.json({ photoUrl, photos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Get profiles to discover
router.get('/discover/available', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = 10;
    const offset = page * limit;

    const result = await db.query(
      `SELECT id, username, first_name, last_name, bio, age, location, sailing_level, boat_type, photos
       FROM users
       WHERE id != $1 AND id NOT IN (
         SELECT target_user_id FROM swipes WHERE user_id = $1
       )
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.userId, limit, offset]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

module.exports = router;
