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

check_service() {
    local service=$1
    local url=$2
    local expected_status=${3:-200}
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        print_success "$service is healthy"
        return 0
    else
        print_error "$service is not responding correctly"
        return 1
    fi
}

check_docker_service() {
    local service=$1
    
    if docker-compose ps "$service" | grep -q "Up"; then
        print_success "$service container is running"
        return 0
    else
        print_error "$service container is not running"
        return 1
    fi
}

echo "=================================================="
echo "San2Stic Health Check"
echo "=================================================="
echo ""

print_status "Checking Docker containers..."
services=("nginx" "backend" "db" "ipfs" "icecast" "tor" "redis")
container_issues=0

for service in "${services[@]}"; do
    if ! check_docker_service "$service"; then
        container_issues=$((container_issues + 1))
    fi
done

echo ""

print_status "Checking web services..."
service_issues=0

if ! check_service "Frontend" "http://localhost/"; then
    service_issues=$((service_issues + 1))
fi

if ! check_service "Backend API" "http://localhost/api/health"; then
    service_issues=$((service_issues + 1))
fi

if ! check_service "IPFS Gateway" "http://localhost/ipfs/"; then
    service_issues=$((service_issues + 1))
fi

if ! check_service "Icecast" "http://localhost/stream" "404"; then
    service_issues=$((service_issues + 1))
fi

echo ""

print_status "Checking Tor hidden service..."
if [ -f "/tmp/onion_address.txt" ] || docker-compose exec -T tor test -f /var/lib/tor/hidden_service/hostname; then
    ONION_ADDRESS=$(docker-compose exec -T tor cat /var/lib/tor/hidden_service/hostname 2>/dev/null | tr -d '\r\n' || echo "Not available")
    if [ "$ONION_ADDRESS" != "Not available" ]; then
        print_success "Tor hidden service: $ONION_ADDRESS"
    else
        print_warning "Tor hidden service address not yet generated"
    fi
else
    print_error "Tor hidden service not configured"
fi

echo ""

print_status "Checking IPFS node..."
if docker-compose exec -T ipfs ipfs id >/dev/null 2>&1; then
    IPFS_ID=$(docker-compose exec -T ipfs ipfs id --format="<id>" 2>/dev/null | tr -d '\r\n')
    print_success "IPFS node ID: $IPFS_ID"
else
    print_error "IPFS node not responding"
    service_issues=$((service_issues + 1))
fi

echo ""

print_status "Checking database..."
if docker-compose exec -T db pg_isready -U san2stic >/dev/null 2>&1; then
    print_success "PostgreSQL database is ready"
else
    print_error "PostgreSQL database not responding"
    service_issues=$((service_issues + 1))
fi

echo ""

echo "=================================================="
if [ $container_issues -eq 0 ] && [ $service_issues -eq 0 ]; then
    print_success "All services are healthy!"
    exit 0
else
    print_error "Found $container_issues container issues and $service_issues service issues"
    echo ""
    echo "Troubleshooting commands:"
    echo "  View logs: docker-compose logs -f [service_name]"
    echo "  Restart services: docker-compose restart"
    echo "  Check status: docker-compose ps"
    exit 1
fi
