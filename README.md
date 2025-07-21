# San2Stic Collaborative Map & Radio

**San2Stic** is a decentralized collaborative field recording mapping application with live radio streaming, powered by blockchain technology for transparent content management and licensing.

## 🏗️ Architecture Overview

| Layer           | Technology                                    | Purpose                                    |
|-----------------|-----------------------------------------------|--------------------------------------------|
| **Frontend**    | React 18 + Tailwind CSS + React-Leaflet     | Interactive map interface & user experience |
| **Backend**     | Node.js + Express + Sequelize (PostgreSQL)  | API server & database management          |
| **Blockchain**  | Solidity + Foundry (Base Network)           | Decentralized recording & license management |
| **Authentication** | JWT + bcrypt                              | Secure user authentication                |
| **Storage**     | IPFS + Local Storage                        | Decentralized audio file storage & distribution |
| **Streaming**   | Icecast                                      | Live radio streaming                       |
| **Deployment** | Docker + IPFS + Tor Hidden Services         | Decentralized containerized deployment     |

## 📁 Project Structure

```
San2Stic---Maps/
├── 🎨 frontend/              # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Utility functions
│   └── package.json
├── 🔧 backend/               # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   └── config/          # Configuration files
│   └── package.json
├── ⛓️ contracts/             # Smart contracts (Foundry)
│   ├── src/                 # Solidity contracts
│   ├── test/                # Contract tests
│   ├── script/              # Deployment scripts
│   └── foundry.toml
├── 🐳 infra/                 # Infrastructure & deployment
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.icecast
│   └── icecast.xml
├── 🔄 .github/workflows/     # CI/CD pipelines
│   ├── docker-build-push.yml
│   ├── deploy.yml
│   └── cleanup-images.yml
├── 📜 scripts/               # Utility scripts
│   ├── test-builds.sh
│   ├── pull-images.sh
│   └── start-prod.sh
└── 📚 docs/                  # Documentation
    └── CI-CD.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database
- Google Cloud Storage account
- Foundry (for smart contracts)

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm start
```

**Environment Variables:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/san2stic
JWT_SECRET=your-jwt-secret
GOOGLE_CLOUD_STORAGE_BUCKET=your-gcs-bucket
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
PORT=4000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The application will be available at `http://localhost:3000`.

### 3. Smart Contracts Setup

```bash
cd contracts
forge install
forge build
forge test
```

**Deploy to Base Sepolia (testnet):**
```bash
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify
```

### 4. Decentralized Deployment

**Quick Local Deployment:**

```bash
# Clone and setup
git clone https://github.com/EpicSanDev/San2Stic---Maps.git
cd San2Stic---Maps
cp .env.example .env
# Edit .env with your configuration

# Deploy with decentralized services (IPFS + Tor)
docker compose up -d

# Check your Tor hidden service address
docker compose logs tor | grep "onion"

# Access IPFS gateway
open http://localhost:8080
```

**Decentralized Features:**
- **IPFS Storage**: All files stored on decentralized IPFS network
- **Tor Hidden Service**: Anonymous .onion access for censorship resistance  
- **Local Infrastructure**: No reliance on cloud providers
- **Self-hosted**: Complete control over your data and services

See [DECENTRALIZED_DEPLOYMENT.md](DECENTRALIZED_DEPLOYMENT.md) for comprehensive deployment guide.

### 5. Development with Docker

```bash
# Build and test all services locally
./scripts/test-builds.sh

# Start development environment
docker-compose up -d --build
```

### 6. Icecast Streaming (Optional)

```bash
icecast -c infra/icecast.xml
```

## 🔗 Smart Contract Integration

The application integrates with smart contracts deployed on Base blockchain:

- **San2SticMap**: User registration and reputation management
- **RecordingManager**: Decentralized recording metadata and licensing
- **LicenseManager**: Creative Commons and custom license management
- **VotingSystem**: Community-driven content moderation

### Contract Addresses (Base Mainnet)
```
San2SticMapMain: 0x34b52da97a0e0fd89a79217c4b934e8af4f4d874
San2SticMap: 0xb80c7e364ea043a2cba314c5169d990186a4a1bc
RecordingManager: 0x114a7e7fb13d65ad3dabbc9874ba2dbc4fe35723
LicenseManager: 0x44d7653f0ebae21cb68841eed645be4d0cd239f8
VotingSystem: 0xc40456ce14809c5e346759a600222ae9229d594a
```

**Deployment Information:**
- **Network**: Base Mainnet (Chain ID: 8453)
- **Deployer**: 0x060934ddb3b077bf2737b8ab24d43aa49c0d7eaf
- **Block Explorer**: [BaseScan](https://basescan.org)
- **Deployment File**: `contracts/deployments/base-mainnet.json`

All contracts are verified and operational on Base mainnet. The deployment includes proper role assignments and cross-contract integrations.

## 🎯 Key Features

### 🗺️ Interactive Mapping
- Real-time collaborative map with field recordings
- Geolocation-based audio discovery
- Clustering for performance optimization
- Mobile-responsive design

### 🎵 Audio Management
- Upload and stream high-quality audio recordings
- Automatic metadata extraction
- IPFS integration for decentralized storage
- Multiple audio format support

### ⚖️ Licensing System
- Creative Commons license integration
- Custom licensing options
- Blockchain-verified licensing
- Attribution tracking

### 🗳️ Community Moderation
- Decentralized voting system
- Reputation-based moderation
- Transparent moderation history
- Anti-spam mechanisms

### 📻 Live Radio
- Icecast streaming integration
- Playlist management
- Real-time listener statistics

## 🔧 Development

### Running Tests

**Backend:**
```bash
cd backend
npm test
```

**Frontend:**
```bash
cd frontend
npm test
```

**Smart Contracts:**
```bash
cd contracts
forge test
forge coverage
```

### Code Quality

The project uses:
- ESLint + Prettier for JavaScript/TypeScript
- Solhint for Solidity
- Husky for pre-commit hooks

### API Documentation

The backend API follows RESTful conventions:

- `GET /api/recordings` - Fetch all recordings
- `POST /api/recordings` - Create new recording
- `GET /api/recordings/user` - Get user's recordings
- `POST /api/auth/login` - User authentication
- `POST /api/auth/signup` - User registration

## 🚀 Deployment

### Using Docker

```bash
docker-compose up -d
```

### Railway Deployment

The project is configured for Railway deployment with automatic builds from the main branch.

### Manual Deployment

1. Build frontend: `cd frontend && npm run build`
2. Deploy backend to your preferred platform
3. Deploy smart contracts to Base mainnet
4. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@san2stic.com
- 💬 Discord: [San2Stic Community](https://discord.gg/san2stic)
- 🐛 Issues: [GitHub Issues](https://github.com/EpicSanDev/San2Stic---Maps/issues)

---

**Built with ❤️ by the San2Stic community**
