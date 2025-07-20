const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToIPFS, gatewayUrl } = require('../config/ipfs');
const { verifySignature } = require('../middleware/signatureMiddleware');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

router.post('/upload', upload.single('file'), verifySignature, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const file = req.file;
    const result = await uploadToIPFS(file.buffer, file.originalname, {
      uploadedBy: req.userAddress,
      mimeType: file.mimetype
    });

    res.json({
      hash: result.hash,
      url: result.url,
      gateway: gatewayUrl
    });

  } catch (error) {
    console.error('Erreur upload IPFS:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;