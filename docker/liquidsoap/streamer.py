#!/usr/bin/env python3
"""
Simple Python-based audio streamer for San2Stic Radio
This replaces LiquidSoap with a more lightweight solution using FFmpeg
"""

import os
import sys
import time
import subprocess
import signal
import threading
import logging
from pathlib import Path
import random

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RadioStreamer:
    def __init__(self):
        self.playlist_path = '/var/log/ezstream/playlist.m3u'
        self.icecast_host = 'icecast'
        self.icecast_port = 8000
        self.icecast_password = 'secure_source_password'
        self.mount_point = '/stream'
        self.running = False
        self.current_process = None
        self.playlist_tracks = []
        self.last_playlist_mtime = 0
        
    def load_playlist(self):
        """Load tracks from M3U playlist file"""
        try:
            if not os.path.exists(self.playlist_path):
                logger.warning(f"Playlist file not found: {self.playlist_path}")
                return []
            
            # Check if playlist file has been modified
            current_mtime = os.path.getmtime(self.playlist_path)
            if current_mtime <= self.last_playlist_mtime:
                return self.playlist_tracks
                
            self.last_playlist_mtime = current_mtime
            
            tracks = []
            with open(self.playlist_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            current_track = {}
            for line in lines:
                line = line.strip()
                if line.startswith('#EXTINF:'):
                    # Parse EXTINF line: #EXTINF:duration,artist - title
                    parts = line.split(',', 1)
                    if len(parts) == 2:
                        duration_part = parts[0].split(':')[1]
                        title_part = parts[1]
                        current_track = {
                            'duration': duration_part,
                            'title': title_part
                        }
                elif line and not line.startswith('#') and current_track:
                    # This is the URL/file path
                    current_track['url'] = line
                    tracks.append(current_track.copy())
                    current_track = {}
            
            self.playlist_tracks = tracks
            logger.info(f"Loaded {len(tracks)} tracks from playlist")
            return tracks
            
        except Exception as e:
            logger.error(f"Error loading playlist: {e}")
            return []
    
    def wait_for_icecast(self):
        """Wait for Icecast server to be ready"""
        logger.info("Waiting for Icecast server...")
        max_attempts = 30
        for attempt in range(max_attempts):
            try:
                result = subprocess.run([
                    'curl', '-s', '-f', f'http://{self.icecast_host}:{self.icecast_port}/status.xsl'
                ], capture_output=True, timeout=5)
                
                if result.returncode == 0:
                    logger.info("Icecast server is ready!")
                    return True
                    
            except subprocess.TimeoutExpired:
                pass
            except Exception as e:
                logger.debug(f"Icecast check failed: {e}")
            
            logger.info(f"Icecast not ready, attempt {attempt + 1}/{max_attempts}")
            time.sleep(5)
        
        logger.error("Icecast server did not become ready in time")
        return False
    
    def stream_track(self, track):
        """Stream a single track to Icecast using FFmpeg"""
        try:
            url = track['url']
            title = track.get('title', 'Unknown Track')
            
            logger.info(f"Streaming track: {title}")
            
            # Build FFmpeg command
            cmd = [
                'ffmpeg',
                '-re',  # Read input at its native frame rate
                '-i', url,  # Input file/URL
                '-acodec', 'libmp3lame',  # MP3 codec
                '-ab', '128k',  # Bitrate
                '-ac', '2',  # Stereo
                '-ar', '44100',  # Sample rate
                '-f', 'mp3',  # Output format
                '-content_type', 'audio/mpeg',  # Content type
                '-ice_name', 'San2Stic Radio',
                '-ice_description', 'Radio collaborative de paysages sonores',
                '-ice_genre', 'Field Recording',
                '-ice_url', 'https://san2stic.com',
                f'icecast://source:{self.icecast_password}@{self.icecast_host}:{self.icecast_port}{self.mount_point}'
            ]
            
            # Start FFmpeg process
            self.current_process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=os.setsid  # Create new process group
            )
            
            # Wait for process to complete
            stdout, stderr = self.current_process.communicate()
            
            if self.current_process.returncode != 0 and self.running:
                logger.error(f"FFmpeg error for track {title}: {stderr.decode()}")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error streaming track {track.get('title', 'Unknown')}: {e}")
            return False
        finally:
            self.current_process = None
    
    def stop_current_stream(self):
        """Stop the current streaming process"""
        if self.current_process:
            try:
                # Kill the entire process group
                os.killpg(os.getpgid(self.current_process.pid), signal.SIGTERM)
                self.current_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                os.killpg(os.getpgid(self.current_process.pid), signal.SIGKILL)
            except Exception as e:
                logger.error(f"Error stopping stream: {e}")
            finally:
                self.current_process = None
    
    def start_streaming(self):
        """Main streaming loop"""
        logger.info("Starting San2Stic Radio streamer...")
        
        if not self.wait_for_icecast():
            return False
        
        self.running = True
        
        while self.running:
            try:
                # Load/reload playlist
                tracks = self.load_playlist()
                
                if not tracks:
                    logger.warning("No tracks in playlist, waiting...")
                    time.sleep(10)
                    continue
                
                # Shuffle tracks for variety
                random.shuffle(tracks)
                
                # Stream each track
                for track in tracks:
                    if not self.running:
                        break
                        
                    success = self.stream_track(track)
                    if not success and self.running:
                        logger.warning(f"Failed to stream track: {track.get('title', 'Unknown')}")
                        # Add a small delay before trying next track
                        time.sleep(2)
                
                # If we finished all tracks, wait a bit before restarting
                if self.running:
                    logger.info("Finished playlist, reloading...")
                    time.sleep(5)
                
            except Exception as e:
                logger.error(f"Error in streaming loop: {e}")
                if self.running:
                    time.sleep(10)
        
        logger.info("Streaming stopped")
        return True
    
    def stop(self):
        """Stop the streamer"""
        logger.info("Stopping streamer...")
        self.running = False
        self.stop_current_stream()

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    logger.info(f"Received signal {signum}, shutting down...")
    streamer.stop()
    sys.exit(0)

if __name__ == "__main__":
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Create and start streamer
    streamer = RadioStreamer()
    try:
        streamer.start_streaming()
    except KeyboardInterrupt:
        logger.info("Interrupted by user")
    finally:
        streamer.stop()