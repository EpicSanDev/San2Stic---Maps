#!/bin/bash

# San2Stic IPFS Deployment Script
# This script builds and deploys the frontend to IPFS for decentralized hosting

set -e

echo "🚀 San2Stic IPFS Deployment"
echo "============================"

# Check if IPFS is installed
if ! command -v ipfs &> /dev/null; then
    echo "❌ IPFS not found. Installing IPFS..."
    
    # Download and install IPFS
    IPFS_VERSION="v0.24.0"
    ARCH=$(uname -m)
    if [ "$ARCH" = "x86_64" ]; then
        ARCH="amd64"
    elif [ "$ARCH" = "aarch64" ]; then
        ARCH="arm64"
    fi
    
    wget "https://dist.ipfs.io/kubo/${IPFS_VERSION}/kubo_${IPFS_VERSION}_linux-${ARCH}.tar.gz"
    tar -xzf "kubo_${IPFS_VERSION}_linux-${ARCH}.tar.gz"
    sudo mv kubo/ipfs /usr/local/bin/
    rm -rf kubo "kubo_${IPFS_VERSION}_linux-${ARCH}.tar.gz"
    
    echo "✅ IPFS installed successfully"
fi

# Initialize IPFS if not already done
if [ ! -d ~/.ipfs ]; then
    echo "🔧 Initializing IPFS..."
    ipfs init
fi

# Start IPFS daemon in background if not running
if ! pgrep -x "ipfs" > /dev/null; then
    echo "🔄 Starting IPFS daemon..."
    ipfs daemon &
    IPFS_PID=$!
    sleep 5  # Wait for daemon to start
else
    echo "✅ IPFS daemon already running"
    IPFS_PID=""
fi

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm ci
npm run build
cd ..

# Add frontend build to IPFS
echo "📤 Adding frontend to IPFS..."
cd frontend/build
IPFS_HASH=$(ipfs add -r -Q .)

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo "📎 IPFS Hash: $IPFS_HASH"
echo ""
echo "🌐 Access your decentralized San2Stic deployment at:"
echo "   https://ipfs.io/ipfs/$IPFS_HASH"
echo "   https://cloudflare-ipfs.com/ipfs/$IPFS_HASH"
echo "   https://gateway.pinata.cloud/ipfs/$IPFS_HASH"
echo ""
echo "🔗 Local IPFS gateway:"
echo "   http://localhost:8080/ipfs/$IPFS_HASH"
echo ""

# Save deployment info
echo "IPFS_HASH=$IPFS_HASH" > ../../ipfs-deployment.txt
echo "DEPLOYED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> ../../ipfs-deployment.txt
echo "FRONTEND_VERSION=$(grep version package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d ' ')" >> ../../ipfs-deployment.txt

echo "💾 Deployment info saved to ipfs-deployment.txt"

# Publish to IPNS (if you have a key)
echo ""
echo "📡 Publishing to IPNS (InterPlanetary Name System)..."
IPNS_NAME=$(ipfs name publish /ipfs/$IPFS_HASH 2>/dev/null | grep -o 'k[0-9A-Za-z]*' | head -1)

if [ ! -z "$IPNS_NAME" ]; then
    echo "✅ Published to IPNS: $IPNS_NAME"
    echo "🔗 IPNS URL: https://ipfs.io/ipns/$IPNS_NAME"
    echo "IPNS_NAME=$IPNS_NAME" >> ../../ipfs-deployment.txt
else
    echo "ℹ️  IPNS publishing skipped (no keys available)"
fi

# Cleanup
cd ../..

# Stop IPFS daemon if we started it
if [ ! -z "$IPFS_PID" ]; then
    echo "🛑 Stopping IPFS daemon..."
    kill $IPFS_PID 2>/dev/null || true
fi

echo ""
echo "🎯 Next Steps:"
echo "  1. Share the IPFS hash for others to access your site"
echo "  2. Pin the content to ensure it stays available"
echo "  3. Consider using an ENS domain to point to your IPFS deployment"
echo "  4. Set up automatic pinning with services like Pinata or Web3.Storage"
echo ""
echo "📚 Learn more about IPFS deployment: https://docs.ipfs.io/"