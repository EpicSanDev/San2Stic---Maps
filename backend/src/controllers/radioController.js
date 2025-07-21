const radioService = require('../services/radioService');

/**
 * Get current radio playlist
 */
exports.getPlaylist = async (req, res) => {
  try {
    const tracks = radioService.getPlaylistTracks();
    const stats = radioService.getPlaylistStats();
    
    res.json({
      tracks,
      stats,
      message: 'Radio playlist retrieved successfully'
    });
  } catch (err) {
    console.error('Error getting radio playlist:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get radio playlist statistics
 */
exports.getStats = async (req, res) => {
  try {
    const stats = radioService.getPlaylistStats();
    
    res.json({
      stats,
      message: 'Radio stats retrieved successfully'
    });
  } catch (err) {
    console.error('Error getting radio stats:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Add a track to the radio playlist (admin only)
 */
exports.addTrack = async (req, res) => {
  try {
    const { url, artist, title, duration } = req.body;
    
    if (!url || !artist || !title) {
      return res.status(400).json({ error: 'URL, artist, and title are required' });
    }

    const success = radioService.addTrackToPlaylist({
      url,
      artist,
      title,
      duration: duration || -1
    });

    if (success) {
      res.json({ message: 'Track added to radio playlist successfully' });
    } else {
      res.status(500).json({ error: 'Failed to add track to playlist' });
    }
  } catch (err) {
    console.error('Error adding track to radio:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Remove a track from the radio playlist (admin only)
 */
exports.removeTrack = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const success = radioService.removeTrackFromPlaylist(url);

    if (success) {
      res.json({ message: 'Track removed from radio playlist successfully' });
    } else {
      res.status(404).json({ error: 'Track not found in playlist' });
    }
  } catch (err) {
    console.error('Error removing track from radio:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Clear the radio playlist (admin only)
 */
exports.clearPlaylist = async (req, res) => {
  try {
    radioService.clearPlaylist();
    res.json({ message: 'Radio playlist cleared successfully' });
  } catch (err) {
    console.error('Error clearing radio playlist:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Rebuild the radio playlist (admin only)
 */
exports.rebuildPlaylist = async (req, res) => {
  try {
    const { tracks } = req.body;
    
    if (!Array.isArray(tracks)) {
      return res.status(400).json({ error: 'Tracks must be an array' });
    }

    // Validate each track
    for (const track of tracks) {
      if (!track.url || !track.artist || !track.title) {
        return res.status(400).json({ 
          error: 'Each track must have url, artist, and title' 
        });
      }
    }

    radioService.rebuildPlaylist(tracks);
    res.json({ message: 'Radio playlist rebuilt successfully' });
  } catch (err) {
    console.error('Error rebuilding radio playlist:', err);
    res.status(500).json({ error: err.message });
  }
};