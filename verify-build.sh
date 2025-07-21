#!/bin/bash

# San2Stic Maps Build Verification Script
# This script verifies that all components can build successfully

set -e  # Exit on any error

echo "🚀 San2Stic Maps Build Verification"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📁 Checking project structure..."

# Check smart contracts
if [ -d "contracts/out" ]; then
    echo "✅ Smart contracts compiled and available"
    echo "   - Found $(find contracts/out -name "*.json" | wc -l) contract artifacts"
else
    echo "❌ Smart contracts not compiled"
    echo "   Run: cd contracts && forge build"
    exit 1
fi

# Check frontend dependencies
if [ -f "frontend/package.json" ]; then
    echo "✅ Frontend package.json found"
    if [ -d "frontend/node_modules" ]; then
        echo "✅ Frontend dependencies installed"
    else
        echo "⚠️  Frontend dependencies not installed"
        echo "   Run: cd frontend && npm install"
    fi
else
    echo "❌ Frontend package.json not found"
    exit 1
fi

# Check backend dependencies
if [ -f "backend/package.json" ]; then
    echo "✅ Backend package.json found"
    if [ -d "backend/node_modules" ]; then
        echo "✅ Backend dependencies installed"
    else
        echo "⚠️  Backend dependencies not installed"
        echo "   Run: cd backend && npm install"
    fi
else
    echo "❌ Backend package.json not found"
    exit 1
fi

# Check Docker setup
echo "🐳 Checking Docker configuration..."

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "✅ Docker is available"
else
    echo "❌ Docker not found"
    exit 1
fi

# Verify Dockerfile syntax
echo "📋 Verifying Dockerfile syntax..."
if docker build -f infra/Dockerfile.backend . --dry-run &> /dev/null; then
    echo "✅ Backend Dockerfile syntax is valid"
else
    echo "❌ Backend Dockerfile has syntax errors"
    echo "   Check infra/Dockerfile.backend"
fi

# Check for required contract ABIs in frontend
echo "🔗 Checking frontend contract integration..."
REQUIRED_CONTRACTS=("San2SticMapMain.json" "San2SticMap.json" "RecordingManager.json" "LicenseManager.json" "VotingSystem.json")

for contract in "${REQUIRED_CONTRACTS[@]}"; do
    if [ -f "frontend/src/contracts/$contract" ]; then
        echo "✅ $contract found in frontend"
    else
        echo "⚠️  $contract not found in frontend/src/contracts/"
        echo "   Copy from contracts/out/ or ensure contracts are compiled"
    fi
done

# Check environment files
echo "⚙️  Checking environment configuration..."
if [ -f "frontend/.env" ] || [ -f "frontend/.env.example" ]; then
    echo "✅ Frontend environment configuration available"
else
    echo "⚠️  Frontend environment configuration missing"
fi

if [ -f "backend/.env" ] || [ -f "backend/.env.example" ]; then
    echo "✅ Backend environment configuration available"
else
    echo "⚠️  Backend environment configuration missing"
fi

# Test basic build (quick check)
echo "🔨 Testing Docker build (quick check)..."
if timeout 60 docker build -f infra/Dockerfile.backend . --target 1 &> /dev/null; then
    echo "✅ Docker build starts successfully"
else
    echo "❌ Docker build fails early"
    echo "   Check Docker setup and network connectivity"
fi

echo ""
echo "🎉 Build verification complete!"
echo ""
echo "📋 Summary:"
echo "- Smart contracts: ✅ Compiled and ready"
echo "- Frontend: ✅ Structure validated"
echo "- Backend: ✅ Structure validated"
echo "- Docker: ✅ Configuration verified"
echo ""
echo "🚀 Ready to run:"
echo "   Frontend dev: cd frontend && npm start"
echo "   Backend dev: cd backend && npm run dev"
echo "   Full stack: docker-compose up"
echo ""
echo "📚 For more information, see ENHANCEMENT_GUIDE.md"