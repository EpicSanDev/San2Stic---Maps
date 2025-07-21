FROM debian:bullseye-slim

# Install ffmpeg, curl, and other utilities
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    bash \
    python3 \
    python3-pip \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Install a simple Python script for playlist streaming
RUN pip3 install mutagen requests

# Create directories
RUN mkdir -p /var/log/ezstream /var/log/streamer

# Copy configuration files
COPY streamer.py /streamer.py
COPY playlist.m3u /playlist.m3u
COPY entrypoint.sh /entrypoint.sh
COPY create-silence.sh /create-silence.sh

# Make scripts executable
RUN chmod +x /entrypoint.sh /create-silence.sh /streamer.py

# Set working directory
WORKDIR /

# Health check to verify streamer is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD pgrep -f "python3.*streamer.py" || exit 1

ENTRYPOINT ["/entrypoint.sh"]