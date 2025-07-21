# San2Stic Production Deployment Guide

## 🚀 Quick Production Start

### 1. Prerequisites
- Docker and Docker Compose installed
- PostgreSQL database (cloud or local)
- Domain name with SSL certificate
- Base blockchain RPC access

### 2. Environment Configuration

Copy the production environment template:
```bash
cp .env.production .env
```

Update the following critical settings in `.env`:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: Generate a secure 256-bit secret
- `CORS_ORIGIN`: Your production domain(s)
- `BLOCKCHAIN_RPC_URL`: Your Base RPC endpoint

### 3. Docker Production Deployment

Build and start all services:
```bash
# Build all images
docker-compose -f docker-compose.production.yml build

# Start in production mode
docker-compose -f docker-compose.production.yml up -d
```

### 4. Health Checks

Verify all services are running:
```bash
# Check API health
curl https://yourdomain.com/api/health

# Check container status
docker-compose -f docker-compose.production.yml ps
```

### 5. SSL and Domain Setup

Configure your reverse proxy (nginx/cloudflare) to:
- Forward traffic to the application containers
- Enable HTTPS with your SSL certificate
- Set proper CORS headers

## 🔧 Development Mode

For local development:
```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start development servers
npm run dev        # Backend on :4000
cd ../frontend && npm start  # Frontend on :3000
```

## 🧪 Testing

Run the test suite:
```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test
```

## 📊 Monitoring

The application includes:
- Health check endpoints (`/api/health`)
- Request rate limiting
- Security headers
- Error logging

Monitor these endpoints for production health.

## 🔐 Security Checklist

- [ ] JWT secret is cryptographically secure
- [ ] Database credentials are strong
- [ ] CORS is configured for your domain only
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced
- [ ] Environment variables are properly secured

## 🛠️ Troubleshooting

Common issues and solutions:

### Database Connection Issues
```bash
# Check database connectivity
docker-compose exec backend npm run db:check
```

### IPFS Storage Issues
```bash
# Restart IPFS container
docker-compose restart ipfs
```

### Blockchain Connection Issues
- Verify RPC endpoint is accessible
- Check contract addresses are correct
- Ensure sufficient RPC rate limits

## 📚 API Documentation

Key endpoints:
- `GET /api/health` - Service health check
- `GET /api/recordings` - Fetch recordings
- `POST /api/recordings` - Upload new recording
- `GET /api/recordings/location` - Get recordings by location

For complete API documentation, see the backend source code.