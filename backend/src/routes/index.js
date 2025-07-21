const router = require('express').Router();
const authRoutes = require('./auth');
const userRoutes = require('./users');
const recordingRoutes = require('./recordings');
const socialRoutes = require('./social');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/recordings', recordingRoutes);
router.use('/', socialRoutes); // Social routes include recordings and users endpoints

module.exports = router;