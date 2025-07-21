const router = require('express').Router();
const { getProfile, updateProfile, getUserRecordings } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

router.get('/me', authenticateToken, getProfile);
router.put('/me', authenticateToken, updateProfile);
router.get('/:id/recordings', getUserRecordings);

module.exports = router;