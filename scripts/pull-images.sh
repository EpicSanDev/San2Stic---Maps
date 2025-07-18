#!/bin/bash

# Script to pull all Docker images from GitHub Container Registry
# Usage: ./scripts/pull-images.sh [GITHUB_REPOSITORY] [TAG]

set -e

# Configuration
GITHUB_REPOSITORY=${1:-"your-username/san2stic-maps"}
TAG=${2:-"latest"}
REGISTRY="ghcr.io"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Services to pull
SERVICES=("backend" "frontend" "nginx" "tor" "ipfs" "icecast")

echo -e "${BLUE}🐳 Pulling Docker images from GitHub Container Registry${NC}"
echo -e "${BLUE}Repository: ${REGISTRY}/${GITHUB_REPOSITORY}${NC}"
echo -e "${BLUE}Tag: ${TAG}${NC}"
echo ""

# Check if user is logged in to GitHub Container Registry
echo -e "${YELLOW}Checking GitHub Container Registry authentication...${NC}"
if ! docker info | grep -q "ghcr.io"; then
    echo -e "${YELLOW}⚠️  You may need to login to GitHub Container Registry first:${NC}"
    echo -e "${YELLOW}   echo \$GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin${NC}"
    echo ""
fi

# Pull each service image
for service in "${SERVICES[@]}"; do
    image_name="${REGISTRY}/${GITHUB_REPOSITORY}/${service}:${TAG}"
    echo -e "${BLUE}📥 Pulling ${service}...${NC}"
    
    if docker pull "$image_name"; then
        echo -e "${GREEN}✅ Successfully pulled ${service}${NC}"
    else
        echo -e "${RED}❌ Failed to pull ${service}${NC}"
        echo -e "${YELLOW}   Make sure the image exists and you have access to it${NC}"
    fi
    echo ""
done

echo -e "${GREEN}🎉 Image pulling completed!${NC}"
echo ""
echo -e "${BLUE}To use the images, run:${NC}"
echo -e "${YELLOW}   export GITHUB_REPOSITORY=${GITHUB_REPOSITORY}${NC}"
echo -e "${YELLOW}   docker-compose -f docker-compose.prod.yml up -d${NC}"
echo ""
echo -e "${BLUE}To check pulled images:${NC}"
echo -e "${YELLOW}   docker images | grep ghcr.io${NC}"