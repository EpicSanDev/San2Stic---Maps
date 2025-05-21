const router = require('express').Router();
const { getAllRecordings, createRecording, getUserRecordings } = require('../controllers/recordingController');
const { authenticate } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Route pour récupérer tous les enregistrements (publique)
router.get('/', getAllRecordings);

// Route pour créer un nouvel enregistrement (protégée et gère l'upload de fichier)
router.post('/', authenticate, upload.single('audioFile'), createRecording);

// Route pour récupérer les enregistrements d'un utilisateur spécifique (protégée)
router.get('/user', authenticate, getUserRecordings);

module.exports = router;