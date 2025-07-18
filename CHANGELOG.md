# Changelog

All notable changes to the San2Stic project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive project documentation with architecture overview
- Web3 integration with Ethereum/Base blockchain support
- Enhanced backend models with blockchain synchronization fields
- Improved recording controller with validation and pagination
- Security middleware with rate limiting and helmet protection
- Validation middleware with Joi schema validation
- Blockchain service for smart contract interaction
- Enhanced frontend hooks for Web3 and improved recordings management
- Recording form component with license selection and geolocation
- API documentation with detailed endpoint specifications
- Support for Creative Commons licensing system
- Enhanced map view with detailed recording popups
- Improved navbar with Web3 wallet connection status

### Changed
- Updated README.md with comprehensive project information
- Enhanced User model with blockchain-related fields (walletAddress, reputation, etc.)
- Enhanced Recording model with licensing, moderation, and blockchain sync fields
- Improved recording routes with CRUD operations
- Updated package.json files with new dependencies (ethers, joi, helmet, etc.)
- Enhanced MapView component with better error handling and loading states
- Updated Navbar component with improved styling and navigation

### Technical Improvements
- Added TypeScript support preparation
- Implemented proper error handling throughout the application
- Added comprehensive input validation
- Enhanced security with rate limiting and CORS configuration
- Improved code organization with service layer pattern
- Added support for pagination in API endpoints
- Implemented soft delete pattern for recordings
- Added comprehensive logging capabilities

### Smart Contract Integration
- Prepared infrastructure for smart contract synchronization
- Added blockchain service layer for contract interactions
- Implemented Web3 utilities for frontend blockchain integration
- Added support for decentralized licensing and voting systems

## [1.0.0] - Previous Version
### Added
- Initial project structure with React frontend and Node.js backend
- Basic recording upload and map display functionality
- User authentication with JWT
- Google Cloud Storage integration
- Icecast streaming support
- Smart contracts for decentralized recording management
