#!/bin/bash

set -e

echo "Starting Tor hidden service (simple mode)..."

# Attendre que nginx-tor soit prêt
echo "Waiting for nginx-tor to be ready..."
while ! nc -z nginx-tor 80; do
    sleep 2
done

echo "nginx-tor is ready, starting Tor..."

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
    
    # Sauvegarder l'adresse pour les autres services
    echo "$ONION_ADDRESS" > /shared/onion_address.txt
fi

# Attendre que Tor se termine
wait $TOR_PID