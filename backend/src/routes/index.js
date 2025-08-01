const router = require('express').Router();
const authRoutes = require('./auth');
const userRoutes = require('./users');
const recordingRoutes = require('./recordings');
const socialRoutes = require('./social');
const analyticsRoutes = require('./analytics');
const governanceRoutes = require('./governance');
const radioRoutes = require('./radio');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/recordings', recordingRoutes);
router.use('/', socialRoutes); // Social routes include recordings and users endpoints
router.use('/analytics', analyticsRoutes);
router.use('/governance', governanceRoutes);
router.use('/radio', radioRoutes);

module.exports = router;