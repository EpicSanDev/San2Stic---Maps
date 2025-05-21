const router = require('express').Router();
const authRoutes = require('./auth');
const userRoutes = require('./users');
const recordingRoutes = require('./recordings');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/recordings', recordingRoutes);

module.exports = router;