#!/bin/bash

set -e

echo "Starting Nginx for Tor Hidden Service..."

# Attendre que les services backend soient prêts
echo "Waiting for backend services..."
while ! nc -z backend 4000; do
    echo "Waiting for backend..."
    sleep 2
done

while ! nc -z frontend 80; do
    echo "Waiting for frontend..."
    sleep 2
done

while ! nc -z icecast 8000; do
    echo "Waiting for icecast..."
    sleep 2
done

echo "All backend services are ready!"

# Générer la configuration Nginx à partir du template
cp /etc/nginx/templates/default.conf.template /etc/nginx/conf.d/default.conf

# Tester la configuration Nginx
nginx -t

echo "Starting Nginx for Tor..."
exec "$@"