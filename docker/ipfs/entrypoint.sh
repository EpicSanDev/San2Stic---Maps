#!/bin/sh

set -e

echo "Starting IPFS node setup..."

if [ ! -f "$IPFS_PATH/config" ]; then
    echo "Initializing IPFS repository..."
    ipfs init --profile server
fi

if [ -f "/tmp/ipfs-config.json" ]; then
    echo "Applying custom IPFS configuration..."
    ipfs config replace /tmp/ipfs-config.json
fi

ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["GET", "POST", "PUT", "DELETE"]'
ipfs config --json Gateway.HTTPHeaders.Access-Control-Allow-Origin '["*"]'

ipfs config --json Experimental.FilestoreEnabled true
ipfs config --json Experimental.UrlstoreEnabled true

# ipfs config Datastore.StorageMax 50GB
# ipfs config --json Datastore.StorageGCWatermark 90

echo "IPFS configuration complete."

health_check() {
    echo "Performing IPFS health check..."
    if ipfs id > /dev/null 2>&1; then
        echo "IPFS node is healthy"
        return 0
    else
        echo "IPFS node health check failed"
        return 1
    fi
}

echo "Starting IPFS daemon..."
exec ipfs daemon --enable-gc --migrate=true
