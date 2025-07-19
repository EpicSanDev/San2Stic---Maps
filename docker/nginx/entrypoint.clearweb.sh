#!/bin/bash

set -e

echo "Starting Nginx for Clear Web with Cloudflare support..."

# Vérifier les variables d'environnement
if [ -z "$DOMAIN_NAME" ]; then
    echo "ERROR: DOMAIN_NAME environment variable is required"
    exit 1
fi

echo "Domain: $DOMAIN_NAME"

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
envsubst '${DOMAIN_NAME}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Vérifier si les certificats Cloudflare Origin existent
if [ ! -f "/etc/ssl/cloudflare/cloudflare-origin.pem" ] || [ ! -f "/etc/ssl/cloudflare/cloudflare-origin.key" ]; then
    echo "WARNING: Cloudflare Origin certificates not found!"
    echo "Please place your Cloudflare Origin certificates in:"
    echo "  - /etc/ssl/cloudflare/cloudflare-origin.pem"
    echo "  - /etc/ssl/cloudflare/cloudflare-origin.key"
    echo ""
    echo "Generating self-signed certificates for testing..."
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/ssl/cloudflare/cloudflare-origin.key \
        -out /etc/ssl/cloudflare/cloudflare-origin.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN_NAME"
fi

# Tester la configuration Nginx
nginx -t

echo "Starting Nginx..."
exec "$@"