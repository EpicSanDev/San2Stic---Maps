FROM debian:bullseye-slim

# Install liquidsoap and dependencies
RUN apt-get update && apt-get install -y \
    liquidsoap \
    curl \
    bash \
    ffmpeg \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Create directories for liquidsoap
RUN mkdir -p /var/log/ezstream /var/log/liquidsoap

# Copy configuration files
COPY liquidsoap.liq /liquidsoap.liq
COPY playlist.m3u /playlist.m3u
COPY entrypoint.sh /entrypoint.sh
COPY create-silence.sh /create-silence.sh

# Make scripts executable
RUN chmod +x /entrypoint.sh /create-silence.sh

# Set working directory
WORKDIR /

# Health check to verify liquidsoap is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD pgrep liquidsoap || exit 1

ENTRYPOINT ["/entrypoint.sh"]