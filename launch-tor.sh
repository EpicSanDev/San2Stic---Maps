#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

echo "=================================================="
echo "San2Stic Tor Services Quick Launch"
echo "=================================================="
echo ""

if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.example .env
    print_status "Please edit .env file with your configuration before running again."
    exit 1
fi

print_status "Starting all San2Stic services with Tor..."

if [ ! -d "frontend/dist" ]; then
    print_status "Building frontend..."
    cd frontend && npm install && npm run build && cd ..
fi

docker-compose up -d

print_status "Waiting for services to start..."
sleep 10

print_status "Waiting for Tor hidden service address generation..."
TIMEOUT=300  # 5 minutes timeout
ELAPSED=0

while [ $ELAPSED -lt $TIMEOUT ]; do
    if docker-compose exec -T tor test -f /var/lib/tor/hidden_service/hostname 2>/dev/null; then
        ONION_ADDRESS=$(docker-compose exec -T tor cat /var/lib/tor/hidden_service/hostname 2>/dev/null | tr -d '\r\n')
        if [ ! -z "$ONION_ADDRESS" ]; then
            break
        fi
    fi
    sleep 5
    ELAPSED=$((ELAPSED + 5))
    echo -n "."
done

echo ""

if [ ! -z "$ONION_ADDRESS" ]; then
    print_success "Tor hidden service ready!"
    echo ""
    echo "=================================================="
    echo "🌐 ACCESS POINTS"
    echo "=================================================="
    echo ""
    echo "📍 Regular Internet:"
    echo "  - Web Interface: http://localhost"
    echo "  - IPFS Gateway: http://localhost/ipfs/"
    echo "  - Radio Stream: http://localhost/stream"
    echo ""
    echo "🧅 Tor Network (.onion):"
    echo "  - Web Interface: http://$ONION_ADDRESS"
    echo "  - Backend API: http://$ONION_ADDRESS:4000"
    echo "  - Icecast Radio: http://$ONION_ADDRESS:8000"
    echo "  - IPFS API: http://$ONION_ADDRESS:5001"
    echo "  - IPFS Gateway: http://$ONION_ADDRESS:8080"
    echo "  - PostgreSQL: $ONION_ADDRESS:5432"
    echo "  - Redis: $ONION_ADDRESS:6379"
    echo ""
    echo "=================================================="
    echo "🔧 MANAGEMENT COMMANDS"
    echo "=================================================="
    echo ""
    echo "  View logs: docker-compose logs -f [service_name]"
    echo "  Stop services: docker-compose down"
    echo "  Restart: docker-compose restart"
    echo "  Health check: ./scripts/health-check.sh"
    echo ""
else
    print_warning "Tor address generation timed out. Services are running but .onion address may still be generating."
    print_status "Check status with: docker-compose logs tor"
fi

print_success "San2Stic Tor services launched successfully!"
