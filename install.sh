#!/bin/bash

set -e


echo "=================================================="
echo "San2Stic Automated Installation Script"
echo "=================================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

check_requirements() {
    print_status "Checking system requirements..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    # Determine which Docker Compose command to use
    if docker compose version >/dev/null 2>&1; then
        DOCKER_COMPOSE_CMD="docker compose"
    elif command_exists docker-compose; then
        DOCKER_COMPOSE_CMD="docker-compose"
    else
        print_error "Neither 'docker compose' nor 'docker-compose' is available."
        exit 1
    fi
    
    if ! command_exists git; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    if ! command_exists openssl; then
        print_error "OpenSSL is not installed. Please install OpenSSL first."
        exit 1
    fi
    
    print_success "All requirements satisfied (using: $DOCKER_COMPOSE_CMD)"
}

setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp .env.example .env
        
        POSTGRES_PASSWORD=$(generate_password)
        JWT_SECRET=$(generate_password)
        ICECAST_SOURCE_PASSWORD=$(generate_password)
        ICECAST_RELAY_PASSWORD=$(generate_password)
        ICECAST_ADMIN_PASSWORD=$(generate_password)
        
        sed -i "s/secure_password_change_this/${POSTGRES_PASSWORD}/g" .env
        sed -i "s/your_jwt_secret_change_this_to_something_secure/${JWT_SECRET}/g" .env
        sed -i "s/secure_source_password_change_this/${ICECAST_SOURCE_PASSWORD}/g" .env
        sed -i "s/secure_relay_password_change_this/${ICECAST_RELAY_PASSWORD}/g" .env
        sed -i "s/secure_admin_password_change_this/${ICECAST_ADMIN_PASSWORD}/g" .env
        
        print_success "Environment file created with secure passwords"
    else
        print_warning ".env file already exists, skipping generation"
    fi
}

build_frontend() {
    print_status "Building frontend application..."
    
    if [ -d "frontend" ]; then
        cd frontend
        
        if [ ! -d "node_modules" ]; then
            print_status "Installing frontend dependencies..."
            npm install
        fi
        
        print_status "Building frontend for production..."
        npm run build
        
        cd ..
        print_success "Frontend built successfully"
    else
        print_warning "Frontend directory not found, skipping frontend build"
    fi
}

start_services() {
    print_status "Starting San2Stic services..."
    
    print_status "Pulling latest Docker images..."
    $DOCKER_COMPOSE_CMD pull
    
    print_status "Building custom Docker images..."
    $DOCKER_COMPOSE_CMD build
    
    print_status "Starting all services..."
    $DOCKER_COMPOSE_CMD up -d
    
    print_success "All services started"
}

wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    print_status "Waiting for database..."
    timeout=60
    while ! $DOCKER_COMPOSE_CMD exec -T db pg_isready -U san2stic >/dev/null 2>&1; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            print_error "Database failed to start within 60 seconds"
            exit 1
        fi
    done
    print_success "Database is ready"
    
    print_status "Waiting for IPFS node..."
    timeout=60
    while ! $DOCKER_COMPOSE_CMD exec -T ipfs ipfs id >/dev/null 2>&1; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            print_error "IPFS node failed to start within 60 seconds"
            exit 1
        fi
    done
    print_success "IPFS node is ready"
    
    print_status "Waiting for backend API..."
    timeout=60
    while ! curl -f http://localhost/api/health >/dev/null 2>&1; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            print_error "Backend API failed to start within 60 seconds"
            exit 1
        fi
    done
    print_success "Backend API is ready"
}

get_onion_address() {
    print_status "Retrieving Tor .onion address..."
    
    timeout=300  # 5 minutes for vanity address generation
    while [ ! -f "$($DOCKER_COMPOSE_CMD exec -T tor cat /shared/onion_address.txt 2>/dev/null)" ] && [ $timeout -gt 0 ]; do
        sleep 5
        timeout=$((timeout - 5))
        if [ $((timeout % 30)) -eq 0 ]; then
            print_status "Still generating vanity .onion address... (${timeout}s remaining)"
        fi
    done
    
    if [ $timeout -le 0 ]; then
        print_warning "Vanity .onion address generation timed out. Using standard address."
    fi
    
    ONION_ADDRESS=$($DOCKER_COMPOSE_CMD exec -T tor cat /var/lib/tor/hidden_service/hostname 2>/dev/null | tr -d '\r\n' || echo "Address not ready")
    
    if [ "$ONION_ADDRESS" != "Address not ready" ]; then
        print_success "Tor hidden service is available at: $ONION_ADDRESS"
    else
        print_warning "Tor .onion address not yet available. Check logs with: $DOCKER_COMPOSE_CMD logs tor"
    fi
}

setup_database() {
    print_status "Setting up database..."
    
    $DOCKER_COMPOSE_CMD exec -T db psql -U san2stic -d san2stic -c "SELECT create_performance_indexes();" >/dev/null 2>&1 || true
    
    print_success "Database setup completed"
}

display_info() {
    echo ""
    echo "=================================================="
    echo -e "${GREEN}San2Stic Installation Complete!${NC}"
    echo "=================================================="
    echo ""
    echo "🌐 Web Interface: http://localhost"
    echo "🔒 Tor Hidden Service: $ONION_ADDRESS"
    echo "📡 IPFS Gateway: http://localhost/ipfs/"
    echo "📻 Icecast Stream: http://localhost/stream"
    echo "🗄️  Database: PostgreSQL on localhost:5432"
    echo ""
    echo "📋 Management Commands:"
    echo "  View logs:           $DOCKER_COMPOSE_CMD logs -f"
    echo "  Stop services:       $DOCKER_COMPOSE_CMD down"
    echo "  Restart services:    $DOCKER_COMPOSE_CMD restart"
    echo "  Update services:     $DOCKER_COMPOSE_CMD pull && $DOCKER_COMPOSE_CMD up -d"
    echo ""
    echo "🔧 Configuration:"
    echo "  Environment file:    .env"
    echo "  Docker compose:      docker-compose.yml (using: $DOCKER_COMPOSE_CMD)"
    echo ""
    echo "⚠️  Security Notes:"
    echo "  - Change default passwords in .env file"
    echo "  - Configure firewall rules for production"
    echo "  - Regular backup of volumes is recommended"
    echo ""
    echo "📚 Documentation: https://github.com/EpicSanDev/San2Stic---Maps"
    echo "=================================================="
}

cleanup() {
    if [ $? -ne 0 ]; then
        print_error "Installation failed. Cleaning up..."
        $DOCKER_COMPOSE_CMD down >/dev/null 2>&1 || true
    fi
}

trap cleanup EXIT

main() {
    echo "Starting San2Stic installation..."
    echo ""
    
    check_requirements
    setup_environment
    build_frontend
    start_services
    wait_for_services
    setup_database
    get_onion_address
    display_info
    
    print_success "Installation completed successfully!"
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            echo "San2Stic Installation Script"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --help, -h     Show this help message"
            echo "  --no-build     Skip frontend build"
            echo "  --dev          Development mode (keeps source mounted)"
            echo ""
            exit 0
            ;;
        --no-build)
            SKIP_BUILD=true
            shift
            ;;
        --dev)
            DEV_MODE=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

main
