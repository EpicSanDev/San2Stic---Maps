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
const { authenticate } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getAllRecordings);
router.get('/search', searchRecordings);
router.get('/location', getRecordingsByLocation);

router.post('/', authenticate, upload.single('audioFile'), createRecording);
router.get('/user', authenticate, getUserRecordings);
router.put('/:id', authenticate, updateRecording);
router.delete('/:id', authenticate, deleteRecording);

module.exports = router;
