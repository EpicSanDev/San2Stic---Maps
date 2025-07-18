# San2Stic Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying San2Stic with Tor hidden service, self-hosted IPFS, and enhanced security features.

## Architecture

San2Stic consists of the following components:

- **Nginx**: Reverse proxy with security headers and rate limiting
- **Backend**: Node.js/Express API with enhanced security middleware
- **Frontend**: React application with Web3 integration
- **PostgreSQL**: Database with performance optimizations
- **IPFS**: Self-hosted IPFS node for decentralized file storage
- **Icecast**: Streaming server for live radio functionality
- **Tor**: Hidden service with custom .onion address generation
- **Redis**: Caching layer for improved performance

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git
- OpenSSL
- At least 4GB RAM and 20GB storage

### Automated Installation

```bash
# Clone the repository
git clone https://github.com/EpicSanDev/San2Stic---Maps.git
cd San2Stic---Maps

# Run the automated installation script
chmod +x install.sh
./install.sh
```

The installation script will:
1. Check system requirements
2. Generate secure passwords
3. Build the frontend
4. Start all services
5. Generate a custom .onion address starting with "san2stic"
6. Display access information

## Custom .onion Address Generation

The Tor service automatically generates a vanity .onion address starting with "san2stic". This process may take several minutes depending on the prefix length.

### Configuration

Edit the environment variables in `.env`:

```bash
ONION_PREFIX=san2stic
MAX_ATTEMPTS=1000000
```

## IPFS Configuration

The self-hosted IPFS node is configured for optimal performance and security.

### Key Features

- **Storage Limit**: 50GB with automatic garbage collection
- **API Access**: Restricted to Docker network
- **Gateway**: Public read-only access
- **Pinning**: Automatic pinning of uploaded content

## Security Features

### Network Security

- **Rate Limiting**: API endpoints protected with rate limiting
- **Security Headers**: Comprehensive HTTP security headers
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Joi schema validation for all inputs

### Container Security

- **Non-root Users**: All services run as non-root users
- **Read-only Filesystems**: Where applicable
- **Resource Limits**: Memory and CPU limits configured
- **Health Checks**: Automated health monitoring

## Access Points

After successful deployment:

### Via Regular Internet
- **Web Interface**: `http://localhost`
- **IPFS Gateway**: `http://localhost/ipfs/`
- **Streaming**: `http://localhost/stream`

### Via Tor Network (.onion address)
- **Web Interface**: `http://[san2stic-address].onion`
- **Backend API**: `http://[san2stic-address].onion:4000`
- **Icecast Radio**: `http://[san2stic-address].onion:8000`
- **IPFS API**: `http://[san2stic-address].onion:5001`
- **IPFS Gateway**: `http://[san2stic-address].onion:8080`
- **PostgreSQL Database**: `[san2stic-address].onion:5432`
- **Redis Cache**: `[san2stic-address].onion:6379`
- **Streaming via Tor**: `http://[san2stic-address].onion/stream`

## Troubleshooting

### Common Issues

1. **Services not starting**: Check Docker logs and ensure sufficient resources
2. **Database connection errors**: Verify PostgreSQL is running and credentials are correct
3. **IPFS not accessible**: Check network configuration and firewall rules
4. **Tor address not generating**: Increase MAX_ATTEMPTS or check Tor logs

For detailed documentation, see the full deployment guide.
