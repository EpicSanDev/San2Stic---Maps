# San2Stic Radio - Web Radio Streaming Solution

## Overview

This implementation replaces the non-functional ezstream with a Python-based streaming solution that uses FFmpeg for robust audio streaming to Icecast.

## Problem Solved

- **Issue**: ezstream was not working properly for web radio functionality
- **Solution**: Implemented a Python-based streamer with FFmpeg backend
- **Benefit**: More reliable streaming with automatic playlist reloading

## Architecture

### Components

1. **Icecast Server**: Streaming server that broadcasts audio
2. **Python Streamer**: Custom streaming application that:
   - Monitors M3U playlist file for changes
   - Streams audio files using FFmpeg
   - Handles reconnection and error recovery
   - Provides automatic track transitions

3. **Radio Service**: Backend service for playlist management
4. **Radio API**: REST endpoints for radio control

### Files Structure

```
docker/liquidsoap/           # Streaming container (renamed for legacy compatibility)
├── Dockerfile              # Container definition
├── streamer.py             # Python streaming application
├── entrypoint.sh           # Container startup script
├── create-silence.sh       # Silence file generator
└── playlist.m3u           # Initial playlist

backend/src/
├── services/radioService.js # Playlist management service
├── controllers/radioController.js # Radio API endpoints
└── routes/radio.js         # Radio routes
```

## Features

### Automatic Upload Integration

When users upload recordings, they are automatically added to the radio playlist:

```javascript
// In recordingController.js
const trackAdded = radioService.addTrackToPlaylist({
  url: ipfsResult.url,
  artist: artist,
  title: title,
  duration: req.body.duration || -1
});
```

### Radio Management API

- `GET /api/radio/playlist` - Get current playlist
- `GET /api/radio/stats` - Get playlist statistics
- `POST /api/radio/tracks` - Add track (admin only)
- `DELETE /api/radio/tracks` - Remove track (admin only)
- `POST /api/radio/clear` - Clear playlist (admin only)
- `POST /api/radio/rebuild` - Rebuild playlist (admin only)

### Playlist Features

- **Automatic reloading**: Streamer monitors playlist file for changes
- **Shuffle playback**: Tracks are shuffled for variety
- **Fallback handling**: Silence track when no audio available
- **Format support**: MP3, WAV, OGG, MP4 files
- **Cross-platform**: Works with local files and HTTP URLs

### Error Handling

- Graceful fallback to silence when tracks fail
- Automatic reconnection to Icecast
- Robust playlist parsing with error recovery
- Process monitoring and health checks

## Configuration

### Environment Variables

```bash
# Icecast configuration
ICECAST_SOURCE_PASSWORD=secure_source_password
ICECAST_ADMIN_PASSWORD=secure_admin_password
ICECAST_HOSTNAME=localhost

# Streaming settings (in streamer.py)
ICECAST_HOST=icecast
ICECAST_PORT=8000
MOUNT_POINT=/stream
```

### Playlist Format

Standard M3U format with EXTINF metadata:

```m3u
#EXTM3U
#EXTINF:180,Artist Name - Song Title
http://example.com/audio.mp3
#EXTINF:240,Another Artist - Another Song
/local/path/to/file.mp3
```

## Deployment

### Docker Compose

The streamer service is configured in `docker-compose.yml`:

```yaml
streamer:
  build:
    context: ./docker/liquidsoap
    dockerfile: Dockerfile
  volumes:
    - ezstream_playlist:/var/log/ezstream
    - streamer_logs:/var/log/streamer
  depends_on:
    - icecast
    - ipfs
```

### Manual Installation

If Docker isn't available, you can run the streamer manually:

```bash
# Install dependencies
pip3 install mutagen requests

# Create playlist directory
mkdir -p /var/log/ezstream

# Run the streamer
python3 docker/liquidsoap/streamer.py
```

## Testing

### Backend Tests

Radio functionality is tested with comprehensive test suite:

```bash
cd backend
npm test -- --testPathPattern=radio.test.js
```

Tests cover:
- Radio API endpoints
- Playlist management
- Track addition/removal
- Statistics calculation
- Duration formatting

### Manual Testing

1. **Upload a recording** via the frontend
2. **Check playlist**: `GET /api/radio/playlist`
3. **Verify streaming**: Connect to `http://localhost:8000/stream`
4. **Monitor logs**: Check streamer container logs

## Monitoring

### Health Checks

- **Container health**: Checks if Python streamer process is running
- **Icecast connectivity**: Waits for Icecast before starting
- **Playlist monitoring**: Automatic reload when files change

### Logging

- **Streamer logs**: `/var/log/streamer/`
- **Backend logs**: Console output with track additions
- **Icecast logs**: `/var/log/icecast/`

## Troubleshooting

### Common Issues

1. **Streamer not starting**
   - Check Icecast is running: `curl http://localhost:8000/status.xsl`
   - Verify container logs: `docker logs <streamer-container>`

2. **No audio streaming**
   - Check playlist file exists: `/var/log/ezstream/playlist.m3u`
   - Verify audio file URLs are accessible
   - Check FFmpeg is available in container

3. **Playlist not updating**
   - Ensure playlist file permissions are correct
   - Check backend radio service logs
   - Verify volume mounts in docker-compose

### Recovery Steps

1. **Restart streamer**: `docker restart <streamer-container>`
2. **Clear playlist**: `POST /api/radio/clear`
3. **Rebuild playlist**: Re-upload recordings or use API

## Migration from ezstream

The new solution maintains compatibility with existing playlist location (`/var/log/ezstream/playlist.m3u`) but provides:

- **Better reliability**: Python-based with error handling
- **Dynamic updates**: Automatic playlist reloading
- **Enhanced logging**: Detailed operation logs
- **API integration**: Full backend integration
- **Modern stack**: FFmpeg backend with Python control

## Performance

- **Resource usage**: Minimal CPU/memory footprint
- **Streaming quality**: 128kbps MP3, 44.1kHz stereo
- **Latency**: Low-latency streaming with real-time input
- **Scalability**: Handles large playlists efficiently

## Future Enhancements

- **Web interface**: Admin panel for playlist management
- **Metadata display**: Real-time now-playing information
- **Scheduling**: Time-based playlist scheduling
- **Analytics**: Listening statistics and metrics
- **Mobile app**: Dedicated radio app interface