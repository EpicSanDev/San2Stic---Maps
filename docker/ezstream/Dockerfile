FROM alpine:latest

# Install ezstream and curl
RUN apk add --no-cache ezstream curl

# Create a directory for the playlist
RUN mkdir -p /var/log/ezstream

# Copy the configuration, playlist and entrypoint
COPY ezstream.xml .
COPY playlist.m3u .
COPY entrypoint.sh .

# Make the entrypoint executable
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
