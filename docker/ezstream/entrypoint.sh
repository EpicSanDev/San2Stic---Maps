#!/bin/sh

# Wait for Icecast to be ready
while ! curl -s http://icecast:8000/healthz; do
  echo "Waiting for Icecast..."
  sleep 5
done

# Start ezstream
ezstream -c ezstream.xml
