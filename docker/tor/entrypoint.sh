#!/bin/bash

set -e

echo "Starting Tor hidden service setup..."

if [ ! -f "/var/lib/tor/hidden_service/hostname" ]; then
    echo "Generating vanity .onion address..."
    python3 /usr/local/bin/generate-onion.py
fi

if [ -f "/var/lib/tor/hidden_service/hostname" ]; then
    ONION_ADDRESS=$(cat /var/lib/tor/hidden_service/hostname)
    echo "==================================="
    echo "San2Stic .onion address: $ONION_ADDRESS"
    echo "==================================="
    
    echo "$ONION_ADDRESS" > /shared/onion_address.txt
fi

chown -R tor:tor /var/lib/tor
chmod 700 /var/lib/tor/hidden_service
chmod 600 /var/lib/tor/hidden_service/* 2>/dev/null || true

echo "Starting Tor..."
exec tor -f /etc/tor/torrc
