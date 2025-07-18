# San2Stic Collaborative Map & Radio

**San2Stic** is a decentralized collaborative field recording mapping application with live radio streaming, powered by blockchain technology for transparent content management and licensing.

## 🏗️ Architecture Overview

| Layer           | Technology                                    | Purpose                                    |
|-----------------|-----------------------------------------------|--------------------------------------------|
| **Frontend**    | React 18 + Tailwind CSS + React-Leaflet     | Interactive map interface & user experience |
| **Backend**     | Node.js + Express + Sequelize (PostgreSQL)  | API server & database management          |
| **Blockchain**  | Solidity + Foundry (Base Network)           | Decentralized recording & license management |
| **Authentication** | JWT + bcrypt                              | Secure user authentication                |
| **Storage**     | Google Cloud Storage + IPFS                 | Audio file storage & distribution         |
| **Streaming**   | Icecast                                      | Live radio streaming                       |
| **Deployment** | Docker + Railway/GCP                         | Containerized cloud deployment             |

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
│   └── icecast.xml
└── 📚 docs/                  # Documentation
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

### 4. Icecast Streaming (Optional)

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
San2SticMapMain: 0xB80C7e364ea043A2cbA314C5169d990186A4a1bC
San2SticMap: TBD (individual contract addresses)
RecordingManager: TBD (individual contract addresses)
LicenseManager: TBD (individual contract addresses)
VotingSystem: TBD (individual contract addresses)
```

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
