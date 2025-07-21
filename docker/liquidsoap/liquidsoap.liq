#!/bin/bash

# LiquidSoap configuration for San2Stic Radio
# This replaces ezstream with a more robust streaming solution

# Set log level
set("log.level", 3)
set("log.file", true)
set("log.file.path", "/var/log/liquidsoap/liquidsoap.log")

# Configure audio settings
set("audio.samplerate", 44100)
set("frame.audio.samplerate", 44100)

# Create a playlist source that reloads automatically
playlist = playlist.safe("/var/log/ezstream/playlist.m3u", 
  mode="randomize",
  reload_mode="watch"
)

# Create a fallback silence source in case playlist is empty
silence = blank(duration=30.0)

# Add a smooth transition between tracks
source = crossfade(start_next=2.0, fade_in=1.0, fade_out=1.0, playlist)

# Fallback to silence if no tracks are available
radio = fallback(track_sensitive=false, [source, silence])

# Normalize audio levels
radio = normalize(target=-14.0, radio)

# Add metadata
radio = map_metadata(fun(_) -> [("title", "San2Stic Radio - Paysages Sonores")], radio)

# Configure Icecast output
output.icecast(
  %mp3(bitrate=128),
  host="icecast",
  port=8000,
  password="secure_source_password",
  mount="/stream",
  name="San2Stic Radio",
  description="Radio collaborative de paysages sonores",
  url="https://san2stic.com",
  genre="Field Recording",
  radio
)

# Start the streaming
log("San2Stic Radio started with LiquidSoap")