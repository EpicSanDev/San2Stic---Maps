#!/bin/bash

# San2Stic Development Script
set -e

echo "🛠️ Starting San2Stic in development mode..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📋 Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before running again."
    exit 1
fi

# Start only essential services for development
echo "🚀 Starting development services..."
docker-compose up -d db redis ipfs icecast

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if ! docker-compose ps | grep -q "db.*Up"; then
    echo "❌ Database failed to start"
    docker-compose logs db
    exit 1
fi

echo "✅ Development services started"
echo ""
echo "📍 Development URLs:"
echo "   Database: postgresql://localhost:5432/san2stic"
echo "   Redis: redis://localhost:6379"
echo "   IPFS API: http://localhost:5001"
echo "   IPFS Gateway: http://localhost:8080"
echo "   Icecast: http://localhost:8000"
echo ""
echo "🔧 To start the backend:"
echo "   cd backend && npm install && npm run dev"
echo ""
echo "🎨 To start the frontend:"
echo "   cd frontend && npm install && npm start"
echo ""
echo "🛑 To stop services: docker-compose down"