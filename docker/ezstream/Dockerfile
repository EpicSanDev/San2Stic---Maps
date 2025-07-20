FROM alpine:latest

# Install ezstream, curl, and other utilities
RUN apk add --no-cache ezstream curl bash

# Create directories for ezstream
RUN mkdir -p /var/log/ezstream

# Copy the configuration files
COPY ezstream.xml /ezstream.xml
COPY playlist.m3u /playlist.m3u
COPY entrypoint.sh /entrypoint.sh
COPY create-silence.sh /create-silence.sh

# Make scripts executable
RUN chmod +x /entrypoint.sh /create-silence.sh

# Set working directory
WORKDIR /

# Health check to verify ezstream is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD pgrep ezstream || exit 1

ENTRYPOINT ["/entrypoint.sh"]
