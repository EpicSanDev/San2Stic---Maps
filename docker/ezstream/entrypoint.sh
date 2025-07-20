#!/bin/sh

echo "Starting ezstream setup..."

# Create silence file if it doesn't exist
SILENCE_FILE="/var/log/ezstream/silence.mp3"
if [ ! -f "$SILENCE_FILE" ]; then
    echo "Creating silence file..."
    
    # Install ffmpeg for audio generation
    apk add --no-cache ffmpeg
    
    # Create directory if needed
    mkdir -p /var/log/ezstream
    
    # Generate 30 seconds of silence in MP3 format
    ffmpeg -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
           -t 30 -c:a mp3 -b:a 128k "$SILENCE_FILE" -y
    
    echo "Silence file created: $SILENCE_FILE"
else
    echo "Silence file already exists: $SILENCE_FILE"
fi

# Copy playlist to the correct location
cp playlist.m3u /var/log/ezstream/playlist.m3u
echo "Playlist copied to /var/log/ezstream/"

# Wait for Icecast to be ready
echo "Waiting for Icecast to be ready..."
while ! curl -s http://icecast:8000/status.xsl >/dev/null 2>&1; do
  echo "Icecast not ready yet, waiting..."
  sleep 5
done

echo "Icecast is ready, starting ezstream..."

# Start ezstream with verbose output
ezstream -v -c ezstream.xml
