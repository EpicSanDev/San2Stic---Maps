#!/bin/bash

set -e

echo "🧪 San2Stic Deployment Test Suite"
echo "=================================="

# Charger les variables d'environnement
if [ -f ".env.production" ]; then
    source .env.production
else
    echo "❌ Error: .env.production file not found"
    exit 1
fi

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Fonction pour tester un endpoint HTTP
test_http_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $description... "
    
    if command -v curl >/dev/null 2>&1; then
        status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
        if [ "$status_code" = "$expected_status" ]; then
            print_result 0 "$description"
            return 0
        else
            print_result 1 "$description (Status: $status_code)"
            return 1
        fi
    else
        print_result 1 "$description (curl not available)"
        return 1
    fi
}

# Fonction pour tester un service Docker
test_docker_service() {
    local service=$1
    local description=$2
    
    echo -n "Testing $description... "
    
    if docker-compose -f docker-compose.production.yml ps | grep -q "$service.*Up"; then
        print_result 0 "$description"
        return 0
    else
        print_result 1 "$description"
        return 1
    fi
}

# Fonction pour tester la connectivité Tor
test_tor_connectivity() {
    echo -n "Testing Tor connectivity... "
    
    # Vérifier si l'adresse .onion existe
    if docker-compose -f docker-compose.production.yml exec -T tor test -f /var/lib/tor/hidden_service/hostname 2>/dev/null; then
        onion_address=$(docker-compose -f docker-compose.production.yml exec -T tor cat /var/lib/tor/hidden_service/hostname 2>/dev/null | tr -d '\r\n')
        if [ ! -z "$onion_address" ]; then
            print_result 0 "Tor connectivity (Address: $onion_address)"
            echo "$onion_address" > /tmp/onion_address.txt
            return 0
        fi
    fi
    
    print_result 1 "Tor connectivity"
    return 1
}

# Tests des services Docker
echo ""
echo "🐳 Testing Docker Services"
echo "=========================="

test_docker_service "db" "PostgreSQL Database"
test_docker_service "redis" "Redis Cache"
test_docker_service "ipfs" "IPFS Node"
test_docker_service "backend" "Backend API"
test_docker_service "icecast" "Icecast Streaming"
test_docker_service "frontend" "Frontend App"
test_docker_service "nginx-clearweb" "Nginx Clear Web"
test_docker_service "nginx-tor" "Nginx Tor"
test_docker_service "tor" "Tor Hidden Service"

# Tests des endpoints Clear Web
echo ""
echo "🌐 Testing Clear Web Endpoints"
echo "=============================="

if [ ! -z "$DOMAIN_NAME" ]; then
    test_http_endpoint "https://$DOMAIN_NAME/health" "Main site health check"
    test_http_endpoint "https://$DOMAIN_NAME/api/health" "API health check"
    test_http_endpoint "https://$DOMAIN_NAME/stream" "Icecast stream endpoint" "200"
    test_http_endpoint "https://$DOMAIN_NAME/icecast/" "Icecast admin interface"
    test_http_endpoint "https://$DOMAIN_NAME/ipfs/" "IPFS gateway" "404"  # 404 is expected for empty path
else
    echo -e "${YELLOW}⚠️  DOMAIN_NAME not set, skipping Clear Web tests${NC}"
fi

# Tests de connectivité Tor
echo ""
echo "🧅 Testing Tor Hidden Service"
echo "============================="

test_tor_connectivity

# Test des endpoints Tor (si possible)
if [ -f "/tmp/onion_address.txt" ]; then
    onion_address=$(cat /tmp/onion_address.txt)
    echo ""
    echo "🔗 Testing Tor Endpoints"
    echo "========================"
    
    # Note: Ces tests nécessitent que Tor soit installé localement
    if command -v tor >/dev/null 2>&1; then
        echo "Testing Tor endpoints via local Tor proxy..."
        # Ces tests nécessiteraient un proxy Tor local configuré
        echo -e "${YELLOW}⚠️  Local Tor proxy tests require manual setup${NC}"
    else
        echo -e "${YELLOW}⚠️  Tor not installed locally, skipping Tor endpoint tests${NC}"
    fi
    
    echo "Tor Hidden Service Address: http://$onion_address"
fi

# Tests de performance
echo ""
echo "📊 Performance Tests"
echo "==================="

echo -n "Testing database connection... "
if docker-compose -f docker-compose.production.yml exec -T db psql -U san2stic -d san2stic -c "SELECT 1;" >/dev/null 2>&1; then
    print_result 0 "Database connection"
else
    print_result 1 "Database connection"
fi

echo -n "Testing Redis connection... "
if docker-compose -f docker-compose.production.yml exec -T redis redis-cli ping | grep -q "PONG"; then
    print_result 0 "Redis connection"
else
    print_result 1 "Redis connection"
fi

echo -n "Testing IPFS node... "
if docker-compose -f docker-compose.production.yml exec -T ipfs ipfs id >/dev/null 2>&1; then
    print_result 0 "IPFS node"
else
    print_result 1 "IPFS node"
fi

# Tests de sécurité
echo ""
echo "🔒 Security Tests"
echo "================"

if [ ! -z "$DOMAIN_NAME" ]; then
    echo -n "Testing HTTPS redirect... "
    redirect_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://$DOMAIN_NAME" 2>/dev/null || echo "000")
    if [ "$redirect_status" = "301" ] || [ "$redirect_status" = "302" ]; then
        print_result 0 "HTTPS redirect"
    else
        print_result 1 "HTTPS redirect (Status: $redirect_status)"
    fi
    
    echo -n "Testing SSL certificate... "
    if echo | openssl s_client -connect "$DOMAIN_NAME:443" -servername "$DOMAIN_NAME" 2>/dev/null | openssl x509 -noout -dates >/dev/null 2>&1; then
        print_result 0 "SSL certificate"
    else
        print_result 1 "SSL certificate"
    fi
    
    echo -n "Testing security headers... "
    headers=$(curl -s -I "https://$DOMAIN_NAME" 2>/dev/null || echo "")
    if echo "$headers" | grep -q "Strict-Transport-Security" && echo "$headers" | grep -q "X-Content-Type-Options"; then
        print_result 0 "Security headers"
    else
        print_result 1 "Security headers"
    fi
fi

# Résumé des ressources
echo ""
echo "📈 Resource Usage"
echo "================="

echo "Docker containers:"
docker-compose -f docker-compose.production.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "System resources:"
echo "Memory usage:"
free -h

echo ""
echo "Disk usage:"
df -h | grep -E "(Filesystem|/dev/)"

echo ""
echo "Docker disk usage:"
docker system df

# Informations de connexion
echo ""
echo "🌐 Connection Information"
echo "========================"

if [ ! -z "$DOMAIN_NAME" ]; then
    echo "Clear Web URLs:"
    echo "  Main site:    https://$DOMAIN_NAME"
    echo "  API:          https://$DOMAIN_NAME/api"
    echo "  Stream:       https://$DOMAIN_NAME/stream"
    echo "  Icecast:      https://$DOMAIN_NAME/icecast/"
fi

if [ -f "/tmp/onion_address.txt" ]; then
    onion_address=$(cat /tmp/onion_address.txt)
    echo ""
    echo "Tor Hidden Service URLs:"
    echo "  Main site:    http://$onion_address"
    echo "  API:          http://$onion_address/api"
    echo "  Stream:       http://$onion_address/stream"
    echo "  Icecast:      http://$onion_address/icecast/"
fi

echo ""
echo "🎯 Test Summary"
echo "==============="

# Compter les services actifs
active_services=$(docker-compose -f docker-compose.production.yml ps | grep "Up" | wc -l)
total_services=9

echo "Active services: $active_services/$total_services"

if [ $active_services -eq $total_services ]; then
    echo -e "${GREEN}✅ All services are running correctly!${NC}"
else
    echo -e "${RED}❌ Some services are not running. Check the logs:${NC}"
    echo "docker-compose -f docker-compose.production.yml logs"
fi

echo ""
echo "For detailed logs, run:"
echo "  ./scripts/deploy-production.sh logs"
echo ""
echo "For service status, run:"
echo "  ./scripts/deploy-production.sh status"

# Nettoyer les fichiers temporaires
rm -f /tmp/onion_address.txt