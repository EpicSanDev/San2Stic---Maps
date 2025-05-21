const Recording = require('../models/recording');
const User = require('../models/user'); // Ajout de l'import User
const { bucket, bucketName } = require('../config/gcs');
const { v4: uuidv4 } = require('uuid');
const { format } = require('util');

// Récupérer tous les enregistrements avec les informations de l'utilisateur
exports.getAllRecordings = async (req, res) => {
  try {
    const recordings = await Recording.findAll({
      include: [{
        model: User,
        attributes: ['id', 'email'] // Inclure seulement l'id et l'email de l'utilisateur
      }]
    });
    res.json(recordings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Créer un nouvel enregistrement
exports.createRecording = async (req, res) => {
  try {
    const { title, artist, latitude, longitude } = req.body;
    const userId = req.user.id;

    if (!title || !artist || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Title, artist, latitude, and longitude are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required.' });
    }

    const blob = bucket.file(`${uuidv4()}-${req.file.originalname}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: req.file.mimetype,
    });

    blobStream.on('error', (err) => {
      console.error('GCS Upload Error:', err);
      res.status(500).json({ error: 'Failed to upload audio file. ' + err.message });
    });

    blobStream.on('finish', async () => {
      try {
        // Make the file public
        await blob.makePublic();
        const publicUrl = format(`https://storage.googleapis.com/${bucketName}/${blob.name}`);

        const newRecording = await Recording.create({
          title,
          artist,
          latitude,
          longitude,
          audioUrl: publicUrl,
          UserId: userId,
        });
        res.status(201).json(newRecording);
      } catch (err) {
        console.error('Error creating recording after GCS upload:', err);
        res.status(500).json({ error: 'Failed to create recording after GCS upload. ' + err.message });
      }
    });

    blobStream.end(req.file.buffer);

  } catch (err) {
    console.error('Error creating recording:', err);
    res.status(500).json({ error: 'Failed to create recording. ' + err.message });
  }
};

// La fonction getUserRecordings peut rester si elle est utilisée ailleurs, sinon elle peut être supprimée.
// Pour cette tâche, elle n'est pas explicitement demandée.
exports.getUserRecordings = async (req, res) => {
  try {
    const recs = await Recording.findAll({
      where: { UserId: req.user.id },
      include: [{ // Optionnel: inclure les infos utilisateur si besoin ici aussi
        model: User,
        attributes: ['id', 'email']
      }]
    });
    res.json(recs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};