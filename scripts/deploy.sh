#!/bin/bash

# San2Stic Deployment Script
set -e

echo "🚀 Starting San2Stic deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

# Load environment variables
source .env

# Check required environment variables
required_vars=(
    "POSTGRES_PASSWORD"
    "JWT_SECRET"
    "ICECAST_SOURCE_PASSWORD"
    "ICECAST_ADMIN_PASSWORD"
    "REACT_APP_MAPBOX_ACCESS_TOKEN"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p data/postgres
mkdir -p data/ipfs
mkdir -p data/redis
mkdir -p data/tor

# Set permissions
chmod 755 logs data
chmod -R 700 data/tor

echo "✅ Directories created"

# Pull latest images
echo "📦 Pulling Docker images..."
docker-compose pull

# Build custom images
echo "🔨 Building custom images..."
docker-compose build --no-cache

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
services=("db" "backend" "frontend" "ipfs" "icecast" "nginx")
for service in "${services[@]}"; do
    if docker-compose ps | grep -q "${service}.*healthy\|${service}.*Up"; then
        echo "✅ $service is running"
    else
        echo "❌ $service failed to start"
        docker-compose logs $service
        exit 1
    fi
done

# Display service URLs
echo ""
echo "🎉 San2Stic deployed successfully!"
echo ""
echo "📍 Service URLs:"
echo "   Frontend: http://localhost"
echo "   API: http://localhost/api"
echo "   Radio Stream: http://localhost/stream"
echo "   IPFS Gateway: http://localhost/ipfs/"
echo "   Icecast Admin: http://localhost/icecast/"
echo ""

# Show Tor hidden service address if available
if [ -f data/tor/hostname ]; then
    echo "🧅 Tor Hidden Service: http://$(cat data/tor/hostname)"
    echo ""
fi

echo "📊 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart"
echo ""
echo "✨ Happy mapping! 🗺️"