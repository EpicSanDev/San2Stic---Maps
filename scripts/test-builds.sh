#!/bin/bash

# Script to test all Docker builds locally before pushing to CI/CD
# Usage: ./scripts/test-builds.sh

set -e

# Ensure we're using bash (not sh)
if [ -z "$BASH_VERSION" ]; then
    echo "This script requires bash. Please run with: bash $0"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Services configuration (matching CI/CD matrix)
SERVICES="backend:./backend:../infra/Dockerfile.backend frontend:./frontend:Dockerfile nginx:./docker/nginx:Dockerfile tor:./docker/tor:Dockerfile ipfs:./docker/ipfs:Dockerfile icecast:./infra:Dockerfile.icecast"

echo -e "${BLUE}🔨 Testing Docker builds locally${NC}"
echo -e "${BLUE}This will build all services to ensure they work before CI/CD${NC}"
echo ""

# Track results
SUCCESS_COUNT=0
TOTAL_SERVICES=0
RESULTS=""

# Build each service
for service_config in $SERVICES; do
    IFS=':' read -r service context dockerfile <<< "$service_config"
    TOTAL_SERVICES=$((TOTAL_SERVICES + 1))
    
    echo -e "${BLUE}📦 Building ${service}...${NC}"
    echo -e "${YELLOW}   Context: ${context}${NC}"
    echo -e "${YELLOW}   Dockerfile: ${dockerfile}${NC}"
    
    # Build the image
    if docker build -t "test-${service}:latest" "${context}" -f "${context}/${dockerfile}"; then
        echo -e "${GREEN}✅ ${service} build successful${NC}"
        RESULTS="${RESULTS}${service}:✅ SUCCESS\n"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo -e "${RED}❌ ${service} build failed${NC}"
        RESULTS="${RESULTS}${service}:❌ FAILED\n"
    fi
    echo ""
done

# Summary
echo -e "${BLUE}📊 Build Summary${NC}"
echo -e "${BLUE}=================${NC}"
echo ""

echo -e "$RESULTS" | while IFS=':' read -r service status; do
    if [ -n "$service" ]; then
        echo -e "${service}: ${status}"
    fi
done

echo ""
echo -e "${BLUE}Total: ${SUCCESS_COUNT}/${TOTAL_SERVICES} successful${NC}"

if [ $SUCCESS_COUNT -eq $TOTAL_SERVICES ]; then
    echo -e "${GREEN}🎉 All builds successful! Ready for CI/CD${NC}"
    
    echo ""
    echo -e "${BLUE}🧹 Cleaning up test images...${NC}"
    for service_config in $SERVICES; do
        IFS=':' read -r service context dockerfile <<< "$service_config"
        docker rmi "test-${service}:latest" >/dev/null 2>&1 || true
    done
    echo -e "${GREEN}✅ Cleanup completed${NC}"
    
    exit 0
else
    echo -e "${RED}❌ Some builds failed. Please fix the issues before pushing.${NC}"
    
    echo ""
    echo -e "${YELLOW}💡 Tips for debugging:${NC}"
    echo -e "${YELLOW}   - Check Dockerfile syntax${NC}"
    echo -e "${YELLOW}   - Ensure all COPY/ADD source files exist${NC}"
    echo -e "${YELLOW}   - Verify base image availability${NC}"
    echo -e "${YELLOW}   - Check for permission issues${NC}"
    
    exit 1
fi