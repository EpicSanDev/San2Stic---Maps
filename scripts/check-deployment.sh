#!/bin/bash

# Script to check deployment status and health
# Usage: ./scripts/check-deployment.sh [compose-file]

set -e

# Configuration
COMPOSE_FILE=${1:-"docker-compose.prod.yml"}
ENV_FILE=".env.prod"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Checking San2Stic Maps Deployment Status${NC}"
echo -e "${BLUE}Using compose file: ${COMPOSE_FILE}${NC}"
echo ""

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ Compose file ${COMPOSE_FILE} not found${NC}"
    exit 1
fi

# Check if environment file exists (for prod)
if [[ "$COMPOSE_FILE" == *"prod"* ]] && [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  Environment file ${ENV_FILE} not found${NC}"
    echo -e "${YELLOW}   Some checks may not work properly${NC}"
    echo ""
fi

# Container Status
echo -e "${BLUE}📊 Container Status:${NC}"
if [ -f "$ENV_FILE" ]; then
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
else
    docker-compose -f "$COMPOSE_FILE" ps
fi
echo ""

# Health Checks
echo -e "${BLUE}🏥 Health Checks:${NC}"

# Check Nginx
echo -n "Nginx (Web Server): "
if curl -f -s http://localhost/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Unhealthy${NC}"
fi

# Check Backend API
echo -n "Backend API: "
if curl -f -s http://localhost/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Unhealthy${NC}"
fi

# Check Icecast
echo -n "Icecast Streaming: "
if curl -f -s http://localhost/icecast/status.xsl >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Unhealthy${NC}"
fi

# Check IPFS
echo -n "IPFS Node: "
if [ -f "$ENV_FILE" ]; then
    IPFS_STATUS=$(docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T ipfs ipfs id 2>/dev/null || echo "failed")
else
    IPFS_STATUS=$(docker-compose -f "$COMPOSE_FILE" exec -T ipfs ipfs id 2>/dev/null || echo "failed")
fi

if [[ "$IPFS_STATUS" != "failed" ]]; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Unhealthy${NC}"
fi

# Check Database
echo -n "PostgreSQL Database: "
if [ -f "$ENV_FILE" ]; then
    DB_STATUS=$(docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T db pg_isready -U san2stic 2>/dev/null || echo "failed")
else
    DB_STATUS=$(docker-compose -f "$COMPOSE_FILE" exec -T db pg_isready -U san2stic 2>/dev/null || echo "failed")
fi

if [[ "$DB_STATUS" == *"accepting connections"* ]]; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Unhealthy${NC}"
fi

# Check Redis
echo -n "Redis Cache: "
if [ -f "$ENV_FILE" ]; then
    REDIS_STATUS=$(docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T redis redis-cli ping 2>/dev/null || echo "failed")
else
    REDIS_STATUS=$(docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping 2>/dev/null || echo "failed")
fi

if [[ "$REDIS_STATUS" == "PONG" ]]; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Unhealthy${NC}"
fi

echo ""

# Resource Usage
echo -e "${BLUE}💾 Resource Usage:${NC}"
if [ -f "$ENV_FILE" ]; then
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" top
else
    docker-compose -f "$COMPOSE_FILE" top
fi
echo ""

# Logs Summary
echo -e "${BLUE}📋 Recent Logs (last 10 lines per service):${NC}"
SERVICES=("nginx" "backend" "icecast" "ipfs" "db" "redis")

for service in "${SERVICES[@]}"; do
    echo -e "${YELLOW}--- ${service} ---${NC}"
    if [ -f "$ENV_FILE" ]; then
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --tail=5 "$service" 2>/dev/null || echo "Service not running or logs unavailable"
    else
        docker-compose -f "$COMPOSE_FILE" logs --tail=5 "$service" 2>/dev/null || echo "Service not running or logs unavailable"
    fi
    echo ""
done

# Network Information
echo -e "${BLUE}🌐 Network Information:${NC}"
echo -e "${YELLOW}Web Interface: http://localhost${NC}"
echo -e "${YELLOW}API Endpoint: http://localhost/api${NC}"
echo -e "${YELLOW}Icecast Admin: http://localhost/icecast/admin${NC}"
echo -e "${YELLOW}IPFS Gateway: http://localhost/ipfs${NC}"
echo ""

# Useful Commands
echo -e "${BLUE}🛠️  Useful Commands:${NC}"
echo -e "${YELLOW}View all logs:        docker-compose -f ${COMPOSE_FILE} logs -f${NC}"
echo -e "${YELLOW}View service logs:    docker-compose -f ${COMPOSE_FILE} logs -f [service]${NC}"
echo -e "${YELLOW}Restart service:      docker-compose -f ${COMPOSE_FILE} restart [service]${NC}"
echo -e "${YELLOW}Scale service:        docker-compose -f ${COMPOSE_FILE} up -d --scale [service]=N${NC}"
echo -e "${YELLOW}Update images:        docker-compose -f ${COMPOSE_FILE} pull && docker-compose -f ${COMPOSE_FILE} up -d${NC}"
echo -e "${YELLOW}Stop all:             docker-compose -f ${COMPOSE_FILE} down${NC}"
echo ""

echo -e "${GREEN}✅ Deployment check completed!${NC}"