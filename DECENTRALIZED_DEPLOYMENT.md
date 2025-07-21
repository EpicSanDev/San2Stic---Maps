# San2Stic Decentralized Deployment Guide

This guide helps you deploy San2Stic in a fully decentralized manner using IPFS for storage and local infrastructure for maximum privacy and censorship resistance.

## 🎯 Overview

San2Stic is designed to be deployed in a decentralized way using:
- **IPFS** for decentralized file storage
- **Tor Hidden Services** for anonymous access
- **Local Docker deployment** for self-hosting
- **Blockchain integration** for immutable metadata

## 🚀 Quick Start (Local Deployment)

### Prerequisites

- Docker and Docker Compose v2
- At least 4GB RAM
- 50GB free disk space (for IPFS storage)

### 1. Clone and Setup

```bash
git clone https://github.com/EpicSanDev/San2Stic---Maps.git
cd San2Stic---Maps
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` file and update:
- Database passwords
- JWT secret
- Icecast passwords
- Blockchain configuration (if using mainnet)

### 3. Deploy with Docker Compose

```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 4. Access Your Deployment

- **Web Interface**: http://localhost (or your server IP)
- **Tor Hidden Service**: Check `docker compose logs tor` for the .onion address
- **IPFS Gateway**: http://localhost:8080
- **Icecast Stream**: http://localhost:8000

## 🔒 Tor Hidden Service Access

Your deployment automatically creates a Tor hidden service for anonymous access:

1. Wait for Tor service to generate the onion address:
   ```bash
   docker compose logs tor | grep "onion"
   ```

2. Access via Tor browser using the .onion address

3. Share the .onion address for censorship-resistant access

## 🌐 IPFS Decentralized Storage

### How IPFS Works in San2Stic

All audio recordings and metadata are stored on IPFS:
- Files are content-addressed (immutable)
- Distributed across the IPFS network
- Accessible from any IPFS gateway
- Can be pinned for permanent availability

### IPFS Configuration

The deployment includes a local IPFS node that:
- Stores your content locally
- Connects to the global IPFS network
- Provides a local gateway for fast access
- Can be configured to pin important content

### Accessing Files via IPFS

Files stored in your San2Stic instance are accessible via:
- Local gateway: `http://localhost:8080/ipfs/{hash}`
- Public gateways: `https://ipfs.io/ipfs/{hash}`
- Your own IPFS node: `ipfs cat {hash}`

## 📡 Publishing to IPNS

For a permanent, updatable web presence, use IPNS (InterPlanetary Name System):

```bash
# Get your IPFS node ID
docker compose exec ipfs ipfs id

# Publish your site to IPNS
docker compose exec ipfs ipfs name publish /ipfs/{your-site-hash}

# Access via IPNS
# https://ipfs.io/ipns/{your-peer-id}
```

## 🔧 Advanced Configuration

### Custom IPFS Bootstrap Nodes

Add trusted peers to your IPFS configuration:

```bash
# Add bootstrap peers
docker compose exec ipfs ipfs bootstrap add /ip4/{ip}/tcp/4001/p2p/{peer-id}
```

### Tor Configuration

Customize Tor settings by editing `docker/tor/torrc` before deployment.

### Database Persistence

Ensure database persistence across restarts:
- Data is stored in Docker volumes by default
- Backup volumes regularly: `docker compose exec db pg_dump...`

## 🌍 Public Deployment Options

### 1. VPS Deployment

Deploy on a VPS for 24/7 availability:

```bash
# On your VPS
git clone https://github.com/EpicSanDev/San2Stic---Maps.git
cd San2Stic---Maps
# Configure .env for your domain
docker compose up -d
```

### 2. IPFS Pinning Services

For permanent file availability, use IPFS pinning services:
- Pinata.cloud
- Web3.Storage
- Infura IPFS
- Your own IPFS cluster

### 3. ENS Domain (Ethereum Name Service)

Link your deployment to a .eth domain:
1. Register an ENS domain
2. Set content hash to your IPFS deployment
3. Access via ENS-enabled browsers

## 🔐 Security Best Practices

### 1. Environment Security

- Use strong, unique passwords
- Keep JWT secrets secure
- Regularly rotate credentials
- Use HTTPS in production

### 2. Network Security

- Use Tor for anonymous access
- Consider VPN for additional privacy
- Firewall unnecessary ports
- Monitor access logs

### 3. Data Security

- Encrypt sensitive data before IPFS storage
- Regular backups of database
- Monitor IPFS pin status
- Use proper access controls

## 🔄 Maintenance

### Regular Updates

```bash
# Pull latest images
docker compose pull

# Restart services
docker compose down && docker compose up -d
```

### Backup Strategy

```bash
# Backup database
docker compose exec db pg_dump -U san2stic san2stic > backup.sql

# Backup IPFS data
docker cp $(docker compose ps -q ipfs):/data/ipfs ./ipfs-backup
```

### Monitoring

Monitor your deployment:
- Check service health: `docker compose ps`
- Monitor logs: `docker compose logs`
- IPFS stats: `docker compose exec ipfs ipfs stats`
- Tor status: `docker compose exec tor cat /var/lib/tor/hidden_service/hostname`

## 🆘 Troubleshooting

### Common Issues

1. **IPFS connection issues**: Check firewall and network connectivity
2. **Tor service not starting**: Verify Tor configuration and permissions
3. **Database connection errors**: Check credentials and database status
4. **High disk usage**: Monitor IPFS storage and implement garbage collection

### Logs and Debugging

```bash
# View all logs
docker compose logs

# View specific service logs
docker compose logs nginx
docker compose logs ipfs
docker compose logs backend

# Debug mode
docker compose logs -f --tail=100
```

## 🤝 Contributing to Decentralization

Help make San2Stic more decentralized:
- Run a permanent IPFS node
- Pin important content
- Share .onion addresses
- Contribute to the codebase
- Report issues and improvements

## 📞 Support

For support with decentralized deployment:
- Open an issue on GitHub
- Join our Tor hidden service community
- Contact via IPFS chat
- Check the documentation

---

By following this guide, you'll have a fully decentralized San2Stic deployment that prioritizes privacy, censorship resistance, and data sovereignty.