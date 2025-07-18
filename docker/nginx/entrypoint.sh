#!/bin/bash

set -e

echo "Starting Nginx setup..."

echo "Waiting for backend service..."
while ! nc -z backend 4000; do
    sleep 1
done

echo "Waiting for IPFS service..."
while ! nc -z ipfs 5001; do
    sleep 1
done

echo "All services are ready. Starting Nginx..."
exec "$@"
