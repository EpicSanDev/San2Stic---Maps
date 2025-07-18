#!/bin/bash


set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

if [ $# -eq 0 ]; then
    print_error "Please specify network: testnet or mainnet"
    echo "Usage: ./deploy.sh [testnet|mainnet]"
    exit 1
fi

NETWORK=$1

if [ "$NETWORK" != "testnet" ] && [ "$NETWORK" != "mainnet" ]; then
    print_error "Invalid network. Use 'testnet' or 'mainnet'"
    exit 1
fi

if [ -z "$PRIVATE_KEY" ]; then
    print_error "PRIVATE_KEY environment variable is not set"
    exit 1
fi

if [ -z "$BASESCAN_API_KEY" ]; then
    print_warning "BASESCAN_API_KEY not set. Contract verification will be skipped."
fi

if [ "$NETWORK" == "testnet" ]; then
    RPC_URL="https://sepolia.base.org"
    CHAIN_ID=84532
    SCRIPT_PATH="script/DeployTestnet.s.sol:DeployTestnetScript"
    EXPLORER_URL="https://sepolia.basescan.org"
    print_status "Deploying to Base Sepolia Testnet"
else
    RPC_URL="https://mainnet.base.org"
    CHAIN_ID=8453
    SCRIPT_PATH="script/DeployMainnet.s.sol:DeployMainnetScript"
    EXPLORER_URL="https://basescan.org"
    print_warning "Deploying to Base Mainnet - This will use real ETH!"
    
    echo -n "Are you sure you want to deploy to mainnet? (yes/no): "
    read confirmation
    if [ "$confirmation" != "yes" ]; then
        print_status "Deployment cancelled"
        exit 0
    fi
fi

print_status "Network: $NETWORK"
print_status "RPC URL: $RPC_URL"
print_status "Chain ID: $CHAIN_ID"

if ! command -v forge &> /dev/null; then
    print_error "Foundry forge not found. Please install Foundry first."
    exit 1
fi

print_status "Building contracts..."
forge build

if [ $? -ne 0 ]; then
    print_error "Contract compilation failed"
    exit 1
fi

print_status "Running tests..."
forge test

if [ $? -ne 0 ]; then
    print_error "Tests failed. Deployment aborted."
    exit 1
fi

print_status "Deploying contracts to $NETWORK..."
forge script $SCRIPT_PATH \
    --rpc-url $RPC_URL \
    --broadcast \
    --verify \
    --delay 30 \
    -vvvv

if [ $? -eq 0 ]; then
    print_status "Deployment successful!"
    print_status "Check deployment details in broadcast/ directory"
    print_status "View contracts on explorer: $EXPLORER_URL"
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    DEPLOYMENT_FILE="deployments/${NETWORK}_${TIMESTAMP}.json"
    mkdir -p deployments
    
    print_status "Deployment info saved to: $DEPLOYMENT_FILE"
    
    BROADCAST_DIR="broadcast/Deploy.s.sol/$CHAIN_ID"
    if [ -d "$BROADCAST_DIR" ]; then
        print_status "Contract addresses can be found in: $BROADCAST_DIR"
    fi
else
    print_error "Deployment failed"
    exit 1
fi
