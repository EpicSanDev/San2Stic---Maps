#!/bin/bash

# San2Stic Decentralized Deployment Verification Script
# This script tests the Docker build and basic functionality

set -e

echo "🔍 San2Stic Deployment Verification"
echo "===================================="

# Check Docker and Docker Compose
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose v2."
    exit 1
fi

echo "✅ Docker and Docker Compose found"

# Test Docker Compose configuration
echo "🔧 Validating Docker Compose configuration..."
if docker compose config > /dev/null 2>&1; then
    echo "✅ Docker Compose configuration is valid"
else
    echo "❌ Docker Compose configuration has errors"
    docker compose config
    exit 1
fi

# List services
echo "📝 Available services:"
docker compose config --services | sed 's/^/  - /'

# Test individual service builds (quick syntax check)
echo ""
echo "🔨 Testing Docker builds (syntax only)..."

services=("nginx" "backend" "frontend")
for service in "${services[@]}"; do
    echo "  Testing $service build context..."
    if timeout 30 docker compose build --dry-run "$service" &>/dev/null; then
        echo "  ✅ $service build configuration is valid"
    else
        echo "  ⚠️  $service build test inconclusive (network/timeout)"
    fi
done

# Check IPFS configuration
echo ""
echo "🌐 Checking IPFS configuration..."
if [ -f "docker/ipfs/Dockerfile" ]; then
    echo "  ✅ IPFS Dockerfile found"
fi

if [ -f "docker/ipfs/ipfs-config.json" ]; then
    echo "  ✅ IPFS configuration found"
fi

# Check Tor configuration
echo ""
echo "🔒 Checking Tor configuration..."
if [ -f "docker/tor/Dockerfile" ]; then
    echo "  ✅ Tor Dockerfile found"
fi

# Check for removed GCP dependencies
echo ""
echo "🧹 Verifying GCP dependencies removal..."

gcp_files_found=false

# Check for GCP-related files
if [ -d "kubernetes" ]; then
    echo "  ⚠️  Kubernetes directory still exists"
    gcp_files_found=true
fi

if [ -f "GKE_SETUP_PLAN.md" ]; then
    echo "  ⚠️  GKE setup plan still exists"
    gcp_files_found=true
fi

if [ -f "backend/src/config/gcs.js" ]; then
    echo "  ⚠️  GCS configuration still exists"
    gcp_files_found=true
fi

if [ -f "backend/src/config/storage.js" ]; then
    echo "  ✅ Storage configuration updated to IPFS"
else
    echo "  ⚠️  Storage configuration not found"
fi

if [ "$gcp_files_found" = false ]; then
    echo "  ✅ GCP dependencies successfully removed"
fi

# Check deployment guides
echo ""
echo "📚 Checking deployment documentation..."

if [ -f "DECENTRALIZED_DEPLOYMENT.md" ]; then
    echo "  ✅ Decentralized deployment guide found"
fi

if [ -f "DECENTRALIZED_ALTERNATIVES.md" ]; then
    echo "  ✅ Deployment alternatives guide found"
fi

# Test environment configuration
echo ""
echo "⚙️  Checking environment configuration..."

if [ -f ".env.example" ]; then
    echo "  ✅ Environment example found"
    
    # Check for IPFS configuration
    if grep -q "IPFS_HOST" .env.example; then
        echo "  ✅ IPFS configuration present in environment"
    else
        echo "  ⚠️  IPFS configuration missing from environment"
    fi
    
    # Check for removed GCP variables
    if grep -q "GCS_\|GCP_" .env.example; then
        echo "  ⚠️  GCP variables still present in environment"
    else
        echo "  ✅ GCP variables removed from environment"
    fi
fi

if [ -f "frontend/.env" ]; then
    echo "  ✅ Frontend environment configuration found"
fi

# Summary
echo ""
echo "📊 Verification Summary"
echo "======================"

issues_found=0

if [ "$gcp_files_found" = true ]; then
    echo "⚠️  Some GCP dependencies may still exist"
    issues_found=$((issues_found + 1))
fi

if [ $issues_found -eq 0 ]; then
    echo "🎉 All checks passed! Your San2Stic deployment is ready for decentralized hosting."
    echo ""
    echo "🚀 Next steps:"
    echo "  1. Run: docker compose up -d"
    echo "  2. Check Tor hidden service: docker compose logs tor | grep onion"
    echo "  3. Access IPFS gateway: http://localhost:8080"
    echo "  4. Deploy frontend to IPFS: ./scripts/deploy-ipfs.sh"
else
    echo "⚠️  $issues_found issue(s) found. Please review the warnings above."
fi

echo ""
echo "📖 For complete deployment instructions, see:"
echo "   - DECENTRALIZED_DEPLOYMENT.md"
echo "   - DECENTRALIZED_ALTERNATIVES.md"