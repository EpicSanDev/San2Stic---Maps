const express = require('express');
const router = express.Router();
const radioController = require('../controllers/radioController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public routes
router.get('/playlist', radioController.getPlaylist);
router.get('/stats', radioController.getStats);

// Admin-only routes (fallback to moderator if admin role doesn't exist)
router.post('/tracks', authenticateToken, requireRole(['admin', 'moderator']), radioController.addTrack);
router.delete('/tracks', authenticateToken, requireRole(['admin', 'moderator']), radioController.removeTrack);
router.post('/clear', authenticateToken, requireRole(['admin', 'moderator']), radioController.clearPlaylist);
router.post('/rebuild', authenticateToken, requireRole(['admin', 'moderator']), radioController.rebuildPlaylist);

module.exports = router;