const router = require('express').Router();
const { 
  getAllRecordings, 
  createRecording, 
  getUserRecordings, 
  getRecordingsByLocation,
  updateRecording,
  deleteRecording,
  searchRecordings
} = require('../controllers/recordingController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getAllRecordings);
router.get('/search', searchRecordings);
router.get('/location', getRecordingsByLocation);

router.post('/', authenticateToken, upload.single('audioFile'), createRecording);
router.get('/user', authenticateToken, getUserRecordings);
router.put('/:id', authenticateToken, updateRecording);
router.delete('/:id', authenticateToken, deleteRecording);

module.exports = router;
