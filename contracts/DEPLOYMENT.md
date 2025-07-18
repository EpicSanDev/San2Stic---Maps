# San2Stic Map Smart Contract Deployment Guide

This guide explains how to deploy the San2Stic Map smart contracts to Base blockchain (testnet and mainnet).

## Prerequisites

1. **Foundry Installation**
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your private key and API keys
   ```

3. **Required Environment Variables**
   - `PRIVATE_KEY`: Your wallet private key (WITH 0x prefix required)
   - `BASESCAN_API_KEY`: API key from BaseScan for contract verification

## Contract Architecture

The San2Stic Map platform consists of 5 main contracts:

1. **San2SticMap**: User management and authentication
2. **RecordingManager**: Audio recording metadata management
3. **VotingSystem**: Community voting and moderation
4. **LicenseManager**: Copyright and Creative Commons licensing
5. **San2SticMapMain**: Main orchestrator contract with batch operations

## Deployment Methods

### Method 1: Using Deployment Scripts (Recommended)

#### Deploy to Base Sepolia Testnet
```bash
chmod +x deploy.sh
./deploy.sh testnet
```

#### Deploy to Base Mainnet
```bash
./deploy.sh mainnet
```

### Method 2: Using Forge Commands Directly

#### Base Sepolia Testnet
```bash
forge script script/DeployTestnet.s.sol:DeployTestnetScript \
    --rpc-url https://sepolia.base.org \
    --broadcast \
    --verify \
    --delay 30 \
    -vvvv
```

#### Base Mainnet
```bash
forge script script/DeployMainnet.s.sol:DeployMainnetScript \
    --rpc-url https://mainnet.base.org \
    --broadcast \
    --verify \
    --delay 30 \
    -vvvv
```

## Network Information

### Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### Base Mainnet
- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Explorer**: https://basescan.org

## Gas Optimization Features

The contracts include several gas optimization features:

1. **Packed Data Structures**: Using `OptimizedStorage` library
2. **Batch Operations**: Multiple operations in single transaction
3. **Efficient Storage**: Minimized storage slots usage
4. **Assembly Optimizations**: Custom assembly for array operations

## Post-Deployment Steps

1. **Verify Deployment**
   - Check contract addresses in broadcast files
   - Verify contracts on BaseScan explorer
   - Test basic functionality

2. **Configure Permissions**
   - Grant necessary roles to admin addresses
   - Set up moderation permissions
   - Configure license types if needed

3. **Integration Testing**
   - Test with frontend application
   - Verify IPFS integration
   - Test wallet compatibility

## Security Considerations

- **Private Key Security**: Never commit private keys to version control
- **Multi-sig Recommended**: Use multi-signature wallets for mainnet admin roles
- **Gradual Rollout**: Consider deploying to testnet first for thorough testing
- **Contract Verification**: Always verify contracts on BaseScan

## Troubleshooting

### Common Issues

1. **Insufficient Gas**
   ```bash
   # Increase gas limit in deployment script
   --gas-limit 8000000
   ```

2. **RPC Rate Limiting**
   ```bash
   # Add delay between transactions
   --delay 30
   ```

3. **Verification Failures**
   ```bash
   # Manual verification
   forge verify-contract <address> <contract> --chain-id <id>
   ```

### Getting Help

- Check Foundry documentation: https://book.getfoundry.sh/
- Base documentation: https://docs.base.org/
- Community support: Base Discord

## Contract Addresses

After deployment, contract addresses will be saved in:
- `broadcast/` directory (Foundry format)
- `deployments/` directory (JSON format)

Keep these addresses safe for frontend integration and future upgrades.
