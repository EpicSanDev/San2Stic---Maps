const request = require('supertest');
const app = require('../src/server');
const radioService = require('../src/services/radioService');

describe('Radio API Tests', () => {
  
  beforeEach(() => {
    // Clear playlist before each test
    radioService.clearPlaylist();
  });

  describe('GET /api/radio/stats', () => {
    it('should return radio statistics', async () => {
      const response = await request(app)
        .get('/api/radio/stats')
        .expect(200);
      
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('totalTracks');
      expect(response.body.stats).toHaveProperty('totalDuration');
      expect(response.body.stats).toHaveProperty('lastModified');
    });
  });

  describe('GET /api/radio/playlist', () => {
    it('should return current playlist', async () => {
      const response = await request(app)
        .get('/api/radio/playlist')
        .expect(200);
      
      expect(response.body).toHaveProperty('tracks');
      expect(response.body).toHaveProperty('stats');
      expect(Array.isArray(response.body.tracks)).toBe(true);
    });
  });

  describe('Radio Service', () => {
    it('should add tracks to playlist', () => {
      const track = {
        url: 'http://example.com/test.mp3',
        artist: 'Test Artist',
        title: 'Test Song',
        duration: 180
      };

      const result = radioService.addTrackToPlaylist(track);
      expect(result).toBe(true);

      const tracks = radioService.getPlaylistTracks();
      const addedTrack = tracks.find(t => t.url === track.url);
      expect(addedTrack).toBeDefined();
      expect(addedTrack.artist).toBe(track.artist);
      expect(addedTrack.title).toBe(track.title);
    });

    it('should get playlist statistics', () => {
      // Add a test track
      radioService.addTrackToPlaylist({
        url: 'http://example.com/test.mp3',
        artist: 'Test Artist',
        title: 'Test Song',
        duration: 180
      });

      const stats = radioService.getPlaylistStats();
      expect(stats).toHaveProperty('totalTracks');
      expect(stats).toHaveProperty('totalDuration');
      expect(stats.totalTracks).toBeGreaterThan(0);
    });

    it('should remove tracks from playlist', () => {
      const track = {
        url: 'http://example.com/test.mp3',
        artist: 'Test Artist',
        title: 'Test Song',
        duration: 180
      };

      // Add track
      radioService.addTrackToPlaylist(track);
      let tracks = radioService.getPlaylistTracks();
      expect(tracks.some(t => t.url === track.url)).toBe(true);

      // Remove track
      const removed = radioService.removeTrackFromPlaylist(track.url);
      expect(removed).toBe(true);

      tracks = radioService.getPlaylistTracks();
      expect(tracks.some(t => t.url === track.url)).toBe(false);
    });

    it('should format duration correctly', () => {
      const formatted = radioService.formatDuration(185);
      expect(formatted).toBe('3:05');
      
      const formatted2 = radioService.formatDuration(60);
      expect(formatted2).toBe('1:00');
      
      const formatted3 = radioService.formatDuration(0);
      expect(formatted3).toBe('0:00');
    });
  });
});