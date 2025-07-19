#!/bin/bash

set -e

echo "Starting Tor hidden service (simple mode)..."

# Ensure correct permissions for Tor directories
if [ -d "/var/lib/tor" ]; then
    chmod 700 /var/lib/tor
fi

if [ -d "/var/lib/tor/hidden_service" ]; then
    chmod 700 /var/lib/tor/hidden_service
else
    mkdir -p /var/lib/tor/hidden_service
    chmod 700 /var/lib/tor/hidden_service
fi

# Attendre que nginx soit prêt
echo "Waiting for nginx to be ready..."
while ! nc -z nginx 80; do
    sleep 2
done

echo "nginx is ready, starting Tor..."

# Démarrer Tor et attendre la génération de l'adresse .onion
tor -f /etc/tor/torrc &
TOR_PID=$!

# Attendre que l'adresse .onion soit générée
echo "Waiting for .onion address generation..."
while [ ! -f "/var/lib/tor/hidden_service/hostname" ]; do
    sleep 2
done

if [ -f "/var/lib/tor/hidden_service/hostname" ]; then
    ONION_ADDRESS=$(cat /var/lib/tor/hidden_service/hostname)
    echo "==================================="
    echo "San2Stic .onion address: $ONION_ADDRESS"
    echo "==================================="
    
    # Sauvegarder l'adresse pour les autres services (ignore permission errors)
    echo "$ONION_ADDRESS" > /shared/onion_address.txt 2>/dev/null || true
fi

# Attendre que Tor se termine
wait $TOR_PID