const fs = require('fs');
const path = require('path');

class RadioService {
  constructor() {
    // Use different paths for test vs production
    this.playlistPath = process.env.NODE_ENV === 'test' 
      ? '/tmp/test_playlist.m3u' 
      : '/var/log/ezstream/playlist.m3u';
    this.ensurePlaylistExists();
  }

  /**
   * Ensure the playlist file and directory exist
   */
  ensurePlaylistExists() {
    try {
      const dir = path.dirname(this.playlistPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
      
      if (!fs.existsSync(this.playlistPath)) {
        const initialContent = '#EXTM3U\n#EXTINF:30,San2Stic Radio - Silence\n' + 
          (process.env.NODE_ENV === 'test' ? '/tmp/silence.mp3' : '/var/log/ezstream/silence.mp3') + '\n';
        fs.writeFileSync(this.playlistPath, initialContent);
        console.log(`Created initial playlist: ${this.playlistPath}`);
      }
    } catch (error) {
      console.error('Error ensuring playlist exists:', error.message);
    }
  }

  /**
   * Add a new track to the radio playlist
   * @param {Object} track - Track information
   * @param {string} track.url - Audio file URL
   * @param {string} track.artist - Artist name
   * @param {string} track.title - Track title
   * @param {number} track.duration - Duration in seconds (optional)
   */
  addTrackToPlaylist(track) {
    try {
      const { url, artist, title, duration = -1 } = track;
      
      if (!url || !artist || !title) {
        throw new Error('URL, artist, and title are required');
      }

      // Create M3U entry
      const playlistEntry = `#EXTINF:${duration},${artist} - ${title}\n${url}\n`;
      
      // Append to playlist file
      fs.appendFileSync(this.playlistPath, playlistEntry);
      
      console.log(`Added track to radio playlist: ${artist} - ${title}`);
      
      // Trigger playlist reload for LiquidSoap (it watches the file automatically)
      this.touchPlaylistFile();
      
      return true;
    } catch (error) {
      console.error('Error adding track to playlist:', error.message);
      return false;
    }
  }

  /**
   * Touch the playlist file to trigger LiquidSoap reload
   */
  touchPlaylistFile() {
    try {
      const now = new Date();
      fs.utimesSync(this.playlistPath, now, now);
    } catch (error) {
      console.warn('Could not touch playlist file:', error.message);
    }
  }

  /**
   * Get all tracks from the playlist
   */
  getPlaylistTracks() {
    try {
      if (!fs.existsSync(this.playlistPath)) {
        return [];
      }

      const content = fs.readFileSync(this.playlistPath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      const tracks = [];
      let currentTrack = null;

      for (const line of lines) {
        if (line.startsWith('#EXTINF:')) {
          // Parse EXTINF line: #EXTINF:duration,artist - title
          const match = line.match(/#EXTINF:([^,]*),(.+)/);
          if (match) {
            const duration = match[1];
            const titleInfo = match[2];
            const [artist, title] = titleInfo.includes(' - ') 
              ? titleInfo.split(' - ', 2) 
              : ['Unknown', titleInfo];
            
            currentTrack = {
              duration: duration === '-1' ? null : parseInt(duration),
              artist: artist.trim(),
              title: title.trim()
            };
          }
        } else if (line && !line.startsWith('#') && currentTrack) {
          // This is the URL line
          currentTrack.url = line.trim();
          tracks.push(currentTrack);
          currentTrack = null;
        }
      }

      return tracks;
    } catch (error) {
      console.error('Error reading playlist:', error.message);
      return [];
    }
  }

  /**
   * Remove a track from the playlist by URL
   */
  removeTrackFromPlaylist(url) {
    try {
      const tracks = this.getPlaylistTracks();
      const filteredTracks = tracks.filter(track => track.url !== url);
      
      if (tracks.length === filteredTracks.length) {
        return false; // Track not found
      }

      this.rebuildPlaylist(filteredTracks);
      console.log(`Removed track from playlist: ${url}`);
      return true;
    } catch (error) {
      console.error('Error removing track from playlist:', error.message);
      return false;
    }
  }

  /**
   * Rebuild the entire playlist file
   */
  rebuildPlaylist(tracks) {
    try {
      let content = '#EXTM3U\n';
      
      for (const track of tracks) {
        const duration = track.duration || -1;
        content += `#EXTINF:${duration},${track.artist} - ${track.title}\n`;
        content += `${track.url}\n`;
      }

      fs.writeFileSync(this.playlistPath, content);
      this.touchPlaylistFile();
      
      console.log(`Rebuilt playlist with ${tracks.length} tracks`);
    } catch (error) {
      console.error('Error rebuilding playlist:', error.message);
    }
  }

  /**
   * Clear all tracks from playlist (except silence)
   */
  clearPlaylist() {
    try {
      const silenceTrack = {
        url: process.env.NODE_ENV === 'test' ? '/tmp/silence.mp3' : '/var/log/ezstream/silence.mp3',
        artist: 'San2Stic Radio',
        title: 'Silence',
        duration: 30
      };
      
      this.rebuildPlaylist([silenceTrack]);
      console.log('Cleared radio playlist');
    } catch (error) {
      console.error('Error clearing playlist:', error.message);
    }
  }

  /**
   * Get playlist statistics
   */
  getPlaylistStats() {
    try {
      const tracks = this.getPlaylistTracks();
      const totalDuration = tracks.reduce((sum, track) => {
        return sum + (track.duration && track.duration > 0 ? track.duration : 0);
      }, 0);

      return {
        totalTracks: tracks.length,
        totalDuration: totalDuration,
        totalDurationFormatted: this.formatDuration(totalDuration),
        lastModified: fs.existsSync(this.playlistPath) 
          ? fs.statSync(this.playlistPath).mtime 
          : null
      };
    } catch (error) {
      console.error('Error getting playlist stats:', error.message);
      return {
        totalTracks: 0,
        totalDuration: 0,
        totalDurationFormatted: '0:00',
        lastModified: null
      };
    }
  }

  /**
   * Format duration in seconds to MM:SS format
   */
  formatDuration(seconds) {
    if (!seconds || seconds <= 0) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

module.exports = new RadioService();