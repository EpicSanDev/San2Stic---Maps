const router = require('express').Router();
const { getProfile, updateProfile, getUserRecordings } = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfile);
router.get('/:id/recordings', getUserRecordings);

module.exports = router;