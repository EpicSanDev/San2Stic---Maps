#!/bin/bash

set -e

echo "🚀 San2Stic Production Deployment Script"
echo "========================================"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Determine which Docker Compose command to use
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker compose"
elif command_exists docker-compose; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    echo "❌ Error: Neither 'docker compose' nor 'docker-compose' is available."
    exit 1
fi

echo "ℹ️  Using Docker Compose command: $DOCKER_COMPOSE_CMD"
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "docker-compose.production.yml" ]; then
    echo "❌ Error: docker-compose.production.yml not found. Please run this script from the project root."
    exit 1
fi

# Vérifier que le fichier .env.production existe
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found. Please create it from .env.production template."
    exit 1
fi

# Fonction pour vérifier les variables d'environnement critiques
check_env_vars() {
    echo "🔍 Checking environment variables..."
    
    source .env.production
    
    if [ "$POSTGRES_PASSWORD" = "CHANGE_THIS_SECURE_PASSWORD_IN_PRODUCTION" ]; then
        echo "❌ Error: Please change POSTGRES_PASSWORD in .env.production"
        exit 1
    fi
    
    if [ "$JWT_SECRET" = "CHANGE_THIS_JWT_SECRET_TO_SOMETHING_VERY_SECURE_IN_PRODUCTION" ]; then
        echo "❌ Error: Please change JWT_SECRET in .env.production"
        exit 1
    fi
    
    if [ -z "$DOMAIN_NAME" ]; then
        echo "❌ Error: DOMAIN_NAME is required in .env.production"
        exit 1
    fi
    
    echo "✅ Environment variables check passed"
}

# Fonction pour créer le répertoire SSL
setup_ssl() {
    echo "🔐 Setting up SSL certificates directory..."
    
    mkdir -p ssl
    
    if [ ! -f "ssl/cloudflare-origin.pem" ] || [ ! -f "ssl/cloudflare-origin.key" ]; then
        echo "⚠️  WARNING: Cloudflare Origin certificates not found in ssl/ directory"
        echo "   Please place your Cloudflare Origin certificates:"
        echo "   - ssl/cloudflare-origin.pem"
        echo "   - ssl/cloudflare-origin.key"
        echo ""
        echo "   You can get these from: https://dash.cloudflare.com/ssl-tls/origin"
        echo ""
        read -p "Continue with self-signed certificates for testing? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo "✅ Cloudflare Origin certificates found"
    fi
}

# Fonction pour construire les images Docker
build_images() {
    echo "🏗️  Building Docker images..."
    
    $DOCKER_COMPOSE_CMD -f docker-compose.production.yml build --no-cache
    
    echo "✅ Docker images built successfully"
}

# Fonction pour démarrer les services
start_services() {
    echo "🚀 Starting production services..."
    
    # Arrêter les services existants s'ils existent
    $DOCKER_COMPOSE_CMD -f docker-compose.production.yml down --remove-orphans
    
    # Démarrer les services
    $DOCKER_COMPOSE_CMD -f docker-compose.production.yml up -d
    
    echo "✅ Services started successfully"
}

# Fonction pour vérifier la santé des services
check_health() {
    echo "🏥 Checking service health..."
    
    sleep 30  # Attendre que les services démarrent
    
    # Vérifier les services un par un
    services=("db" "redis" "ipfs" "backend" "icecast" "frontend" "nginx-clearweb" "nginx-tor" "tor")
    
    for service in "${services[@]}"; do
        if $DOCKER_COMPOSE_CMD -f docker-compose.production.yml ps | grep -q "$service.*Up"; then
            echo "✅ $service is running"
        else
            echo "❌ $service is not running"
            $DOCKER_COMPOSE_CMD -f docker-compose.production.yml logs "$service"
        fi
    done
}

# Fonction pour afficher les informations de connexion
show_connection_info() {
    echo ""
    echo "🌐 Connection Information"
    echo "========================"
    
    source .env.production
    
    echo "Clear Web (HTTPS): https://$DOMAIN_NAME"
    echo "Clear Web (HTTP):  http://$DOMAIN_NAME (redirects to HTTPS)"
    echo ""
    
    # Attendre que l'adresse .onion soit générée
    echo "⏳ Waiting for Tor .onion address generation..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if $DOCKER_COMPOSE_CMD -f docker-compose.production.yml exec -T tor cat /var/lib/tor/hidden_service/hostname 2>/dev/null; then
            onion_address=$($DOCKER_COMPOSE_CMD -f docker-compose.production.yml exec -T tor cat /var/lib/tor/hidden_service/hostname 2>/dev/null | tr -d '\r\n')
            echo "Tor Hidden Service: http://$onion_address"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        echo "⚠️  Tor .onion address not ready yet. Check logs: $DOCKER_COMPOSE_CMD -f docker-compose.production.yml logs tor"
    fi
    
    echo ""
    echo "🎵 Streaming Endpoints:"
    echo "Clear Web: https://$DOMAIN_NAME/stream"
    if [ ! -z "$onion_address" ]; then
        echo "Tor:       http://$onion_address/stream"
    fi
    
    echo ""
    echo "🔧 Admin Interfaces:"
    echo "Icecast Admin (Clear Web): https://$DOMAIN_NAME/icecast/"
    if [ ! -z "$onion_address" ]; then
        echo "Icecast Admin (Tor):       http://$onion_address/icecast/"
    fi
}

# Fonction pour afficher les logs
show_logs() {
    echo ""
    echo "📋 Recent logs:"
    echo "==============="
    $DOCKER_COMPOSE_CMD -f docker-compose.production.yml logs --tail=20
}

# Menu principal
case "${1:-deploy}" in
    "deploy")
        check_env_vars
        setup_ssl
        build_images
        start_services
        check_health
        show_connection_info
        ;;
    "start")
        $DOCKER_COMPOSE_CMD -f docker-compose.production.yml up -d
        check_health
        show_connection_info
        ;;
    "stop")
        $DOCKER_COMPOSE_CMD -f docker-compose.production.yml down
        ;;
    "restart")
        $DOCKER_COMPOSE_CMD -f docker-compose.production.yml restart
        check_health
        ;;
    "logs")
        $DOCKER_COMPOSE_CMD -f docker-compose.production.yml logs -f
        ;;
    "status")
        $DOCKER_COMPOSE_CMD -f docker-compose.production.yml ps
        show_connection_info
        ;;
    "clean")
        echo "🧹 Cleaning up..."
        $DOCKER_COMPOSE_CMD -f docker-compose.production.yml down --volumes --remove-orphans
        docker system prune -f
        ;;
    *)
        echo "Usage: $0 {deploy|start|stop|restart|logs|status|clean}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Full deployment (build, start, check health)"
        echo "  start   - Start services"
        echo "  stop    - Stop services"
        echo "  restart - Restart services"
        echo "  logs    - Show logs"
        echo "  status  - Show service status and connection info"
        echo "  clean   - Stop services and clean up volumes"
        exit 1
        ;;
esac

echo ""
echo "✅ Operation completed successfully!"