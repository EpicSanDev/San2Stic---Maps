const router = require('express').Router();
const { signup, login, walletLogin } = require('../controllers/authController');
const { verifySignature } = require('../middleware/signatureMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/wallet-login', verifySignature, walletLogin);

module.exports = router;