#!/bin/bash

# Script to start the application in production mode using registry images
# Usage: ./scripts/start-prod.sh [GITHUB_REPOSITORY]

set -e

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

# Configuration
GITHUB_REPOSITORY=${1:-"your-username/san2stic-maps"}
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting San2Stic Maps in Production Mode${NC}"
echo -e "${BLUE}Using Docker Compose command: $DOCKER_COMPOSE_CMD${NC}"
echo -e "${BLUE}Repository: ${GITHUB_REPOSITORY}${NC}"
echo ""

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  Environment file ${ENV_FILE} not found${NC}"
    echo -e "${YELLOW}   Creating from template...${NC}"
    
    if [ -f ".env.prod.example" ]; then
        cp .env.prod.example "$ENV_FILE"
        echo -e "${YELLOW}   Please edit ${ENV_FILE} with your actual values before continuing${NC}"
        echo -e "${YELLOW}   Press Enter when ready...${NC}"
        read -r
    else
        echo -e "${RED}❌ Template file .env.prod.example not found${NC}"
        exit 1
    fi
fi

# Export GitHub repository for docker-compose
export GITHUB_REPOSITORY

# Check if user is logged in to GitHub Container Registry
echo -e "${BLUE}🔐 Checking GitHub Container Registry authentication...${NC}"
if ! docker info 2>/dev/null | grep -q "ghcr.io" && ! docker system info 2>/dev/null | grep -q "ghcr.io"; then
    echo -e "${YELLOW}⚠️  You may need to login to GitHub Container Registry:${NC}"
    echo -e "${YELLOW}   echo \$GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin${NC}"
    echo ""
    echo -e "${YELLOW}Continue anyway? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Pull latest images
echo -e "${BLUE}📥 Pulling latest images...${NC}"
if [ -f "scripts/pull-images.sh" ]; then
    ./scripts/pull-images.sh "$GITHUB_REPOSITORY" "latest"
else
    echo -e "${YELLOW}⚠️  Pull script not found, docker-compose will pull images automatically${NC}"
fi

# Stop any existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
$DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --remove-orphans || true

# Start the application
echo -e "${BLUE}🚀 Starting application...${NC}"
$DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

# Wait a moment for containers to start
echo -e "${BLUE}⏳ Waiting for containers to start...${NC}"
sleep 10

# Check container status
echo -e "${BLUE}📊 Container Status:${NC}"
$DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

echo ""
echo -e "${GREEN}🎉 Application started successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Useful commands:${NC}"
echo -e "${YELLOW}   View logs:        $DOCKER_COMPOSE_CMD -f ${COMPOSE_FILE} logs -f [service]${NC}"
echo -e "${YELLOW}   Check status:     $DOCKER_COMPOSE_CMD -f ${COMPOSE_FILE} ps${NC}"
echo -e "${YELLOW}   Stop application: $DOCKER_COMPOSE_CMD -f ${COMPOSE_FILE} down${NC}"
echo -e "${YELLOW}   Restart service:  $DOCKER_COMPOSE_CMD -f ${COMPOSE_FILE} restart [service]${NC}"
echo ""
echo -e "${BLUE}🌐 Access points:${NC}"
echo -e "${YELLOW}   Web Interface: http://localhost${NC}"
echo -e "${YELLOW}   API Health:    http://localhost/api/health${NC}"
echo -e "${YELLOW}   Icecast:       http://localhost/icecast${NC}"
echo ""

# Health check
echo -e "${BLUE}🏥 Running health checks...${NC}"
sleep 5

# Check nginx
if curl -f -s http://localhost/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Nginx is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx health check failed (may still be starting)${NC}"
fi

# Check backend
if curl -f -s http://localhost/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed (may still be starting)${NC}"
fi

echo ""
echo -e "${GREEN}🚀 Production deployment completed!${NC}"