#!/bin/bash

set -e

echo "Starting Nginx setup..."

# Process templates based on environment
echo "Processing Nginx configuration templates..."

# Detect environment and use appropriate template
if [ "$NGINX_MODE" = "tor" ]; then
    echo "Using Tor configuration..."
    if [ -f "/etc/nginx/templates/tor.conf.template" ]; then
        cp /etc/nginx/templates/tor.conf.template /etc/nginx/conf.d/default.conf
        echo "Tor template processed successfully"
    else
        echo "Warning: Tor template file not found, using default"
        cp /etc/nginx/templates/default.conf.template /etc/nginx/conf.d/default.conf
    fi
elif [ "$NGINX_MODE" = "clearweb" ]; then
    echo "Using Clearweb configuration..."
    if [ -f "/etc/nginx/templates/clearweb.conf.template" ]; then
        cp /etc/nginx/templates/clearweb.conf.template /etc/nginx/conf.d/default.conf
        echo "Clearweb template processed successfully"
    else
        echo "Warning: Clearweb template file not found, using default"
        cp /etc/nginx/templates/default.conf.template /etc/nginx/conf.d/default.conf
    fi
else
    echo "Using default configuration..."
    if [ -f "/etc/nginx/templates/default.conf.template" ]; then
        cp /etc/nginx/templates/default.conf.template /etc/nginx/conf.d/default.conf
        echo "Default template processed successfully"
    else
        echo "Warning: Default template file not found"
    fi
fi

echo "Waiting for backend service..."
while ! nc -z backend 4000; do
    sleep 1
done

echo "Waiting for frontend service..."
while ! nc -z frontend 80; do
    sleep 1
done

echo "Waiting for IPFS service..."
while ! nc -z ipfs 5001; do
    sleep 1
done

echo "All services are ready. Starting Nginx..."
exec "$@"
