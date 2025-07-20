const express = require('express');
const router = express.Router();
const { uploadToIPFS, gatewayUrl } = require('../config/ipfs');
const { verifySignature } = require('../middleware/auth');

router.post('/upload', verifySignature, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const file = req.files.file;
    const result = await uploadToIPFS(file.data, file.name, {
      uploadedBy: req.user.address,
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