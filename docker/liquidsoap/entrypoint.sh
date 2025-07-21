#!/bin/bash

echo "Starting Python-based radio streamer setup..."

# Create silence file if it doesn't exist
SILENCE_FILE="/var/log/ezstream/silence.mp3"
if [ ! -f "$SILENCE_FILE" ]; then
    echo "Creating silence file..."
    
    # Create directory if needed
    mkdir -p /var/log/ezstream
    
    # Generate 30 seconds of silence in MP3 format
    ffmpeg -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
           -t 30 -c:a mp3 -b:a 128k "$SILENCE_FILE" -y
    
    echo "Silence file created: $SILENCE_FILE"
else
    echo "Silence file already exists: $SILENCE_FILE"
fi

# Initialize playlist if it doesn't exist
PLAYLIST_FILE="/var/log/ezstream/playlist.m3u"
if [ ! -f "$PLAYLIST_FILE" ]; then
    echo "Creating initial playlist file..."
    cat > "$PLAYLIST_FILE" << EOF
#EXTM3U
#EXTINF:30,San2Stic Radio - Silence
$SILENCE_FILE
EOF
    echo "Initial playlist created"
else
    echo "Playlist already exists: $PLAYLIST_FILE"
fi

# Wait for Icecast to be ready
echo "Waiting for Icecast to be ready..."
while ! curl -s http://icecast:8000/status.xsl >/dev/null 2>&1; do
  echo "Icecast not ready yet, waiting..."
  sleep 5
done

echo "Icecast is ready, starting Python radio streamer..."

# Create log directory
mkdir -p /var/log/streamer

# Start the Python streamer
python3 /streamer.py