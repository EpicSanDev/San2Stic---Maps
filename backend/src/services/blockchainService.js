const { ethers } = require('ethers');
const User = require('../models/user');
const Recording = require('../models/recording');

// Mock ABIs for testing when contract artifacts are not available
const mockABI = [
  "function isUserRegistered(address) external view returns (bool)",
  "function getUser(address) external view returns (tuple(uint256 id, string username, uint256 reputation, uint256 totalRecordings, uint256 totalVotes))",
  "function getRecording(uint256) external view returns (tuple(int256 latitude, int256 longitude, string ipfsHash), tuple(string title, string description, string[] tags, uint256 duration, uint8 quality, string equipment, uint8 license, uint8 status), tuple(uint256 upvotes, uint256 downvotes, uint256 totalRating, uint256 ratingCount))",
  "function getRecordingsByLocation(int256, int256, int256, int256, uint256, uint256) external view returns (uint256[])",
  "function userReputation(address) external view returns (uint256)"
];

let San2SticMapMainABI, San2SticMapABI, RecordingManagerABI, LicenseManagerABI, VotingSystemABI;

// Try to load contract ABIs, fall back to mock if not available
try {
  San2SticMapMainABI = require('../../contracts/out/San2SticMapMain.sol/San2SticMapMain.json').abi;
  San2SticMapABI = require('../../contracts/out/San2SticMap.sol/San2SticMap.json').abi;
  RecordingManagerABI = require('../../contracts/out/RecordingManager.sol/RecordingManager.json').abi;
  LicenseManagerABI = require('../../contracts/out/LicenseManager.sol/LicenseManager.json').abi;
  VotingSystemABI = require('../../contracts/out/VotingSystem.sol/VotingSystem.json').abi;
  console.log('Contract ABIs loaded successfully');
} catch (error) {
  console.warn('Contract artifacts not found, using mock ABIs for testing');
  San2SticMapMainABI = San2SticMapABI = RecordingManagerABI = LicenseManagerABI = VotingSystemABI = mockABI;
}

class BlockchainService {
  constructor() {
    this.provider = null;
    this.contracts = {};
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'https://mainnet.base.org';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      const contractAddresses = {
        mainContract: process.env.SAN2STIC_MAIN_CONTRACT || '0x34b52da97a0e0fd89a79217c4b934e8af4f4d874',
        san2sticMap: process.env.SAN2STIC_MAP_CONTRACT || '0xb80c7e364ea043a2cba314c5169d990186a4a1bc',
        recordingManager: process.env.RECORDING_MANAGER_CONTRACT || '0x114a7e7fb13d65ad3dabbc9874ba2dbc4fe35723',
        licenseManager: process.env.LICENSE_MANAGER_CONTRACT || '0x44d7653f0ebae21cb68841eed645be4d0cd239f8',
        votingSystem: process.env.VOTING_SYSTEM_CONTRACT || '0xc40456ce14809c5e346759a600222ae9229d594a'
      };
      
      this.contracts = {
        mainContract: new ethers.Contract(contractAddresses.mainContract, San2SticMapMainABI, this.provider),
        san2sticMap: new ethers.Contract(contractAddresses.san2sticMap, San2SticMapABI, this.provider),
        recordingManager: new ethers.Contract(contractAddresses.recordingManager, RecordingManagerABI, this.provider),
        licenseManager: new ethers.Contract(contractAddresses.licenseManager, LicenseManagerABI, this.provider),
        votingSystem: new ethers.Contract(contractAddresses.votingSystem, VotingSystemABI, this.provider)
      };
      
      this.contractAddresses = contractAddresses;
      this.initialized = true;
      console.log('Blockchain service initialized with mainnet contracts:', contractAddresses);
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
    }
  }

  async syncUserWithBlockchain(userId, walletAddress) {
    try {
      if (!this.contracts.san2sticMap) {
        console.warn('San2SticMap contract not available');
        return null;
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const isRegistered = await this.contracts.san2sticMap.isUserRegistered(walletAddress);
      
      if (isRegistered) {
        const blockchainUser = await this.contracts.san2sticMap.getUser(walletAddress);
        
        await user.update({
          blockchainId: blockchainUser.id.toString(),
          walletAddress: walletAddress,
          username: blockchainUser.username,
          reputation: blockchainUser.reputation.toString(),
          totalRecordings: blockchainUser.totalRecordings.toString(),
          totalVotes: blockchainUser.totalVotes.toString(),
          syncedWithBlockchain: true
        });

        return user;
      }

      return null;
    } catch (error) {
      console.error('Error syncing user with blockchain:', error);
      throw error;
    }
  }

  async syncRecordingWithBlockchain(recordingId, blockchainRecordingId) {
    try {
      if (!this.contracts.recordingManager) {
        console.warn('RecordingManager contract not available');
        return null;
      }

      const recording = await Recording.findByPk(recordingId);
      if (!recording) {
        throw new Error('Recording not found');
      }

      const [core, metadata, stats] = await this.contracts.recordingManager.getRecording(blockchainRecordingId);

      await recording.update({
        blockchainId: blockchainRecordingId,
        latitude: (parseInt(core.latitude) / 1000000).toString(),
        longitude: (parseInt(core.longitude) / 1000000).toString(),
        ipfsHash: core.ipfsHash,
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
        duration: metadata.duration.toString(),
        quality: this.mapQualityFromBlockchain(metadata.quality),
        equipment: metadata.equipment,
        license: this.mapLicenseFromBlockchain(metadata.license),
        moderationStatus: this.mapStatusFromBlockchain(metadata.status),
        upvotes: stats.upvotes.toString(),
        downvotes: stats.downvotes.toString(),
        totalRating: stats.totalRating.toString(),
        ratingCount: stats.ratingCount.toString(),
        syncedWithBlockchain: true
      });

      return recording;
    } catch (error) {
      console.error('Error syncing recording with blockchain:', error);
      throw error;
    }
  }

  mapQualityFromBlockchain(blockchainQuality) {
    const qualityMap = ['LOW', 'MEDIUM', 'HIGH', 'LOSSLESS'];
    return qualityMap[blockchainQuality] || 'MEDIUM';
  }

  mapLicenseFromBlockchain(blockchainLicense) {
    const licenseMap = [
      'ALL_RIGHTS_RESERVED',
      'CC_BY',
      'CC_BY_SA',
      'CC_BY_NC',
      'CC_BY_NC_SA',
      'CC_BY_ND',
      'CC_BY_NC_ND',
      'PUBLIC_DOMAIN'
    ];
    return licenseMap[blockchainLicense] || 'ALL_RIGHTS_RESERVED';
  }

  mapStatusFromBlockchain(blockchainStatus) {
    const statusMap = ['PENDING', 'APPROVED', 'REJECTED', 'FLAGGED'];
    return statusMap[blockchainStatus] || 'PENDING';
  }

  async getRecordingsByLocation(minLat, maxLat, minLng, maxLng, offset = 0, limit = 50) {
    try {
      if (!this.contracts.recordingManager) {
        console.warn('RecordingManager contract not available');
        return [];
      }

      const recordingIds = await this.contracts.recordingManager.getRecordingsByLocation(
        Math.floor(minLat * 1000000),
        Math.floor(maxLat * 1000000),
        Math.floor(minLng * 1000000),
        Math.floor(maxLng * 1000000),
        offset,
        limit
      );

      return recordingIds.map(id => parseInt(id));
    } catch (error) {
      console.error('Error fetching recordings by location from blockchain:', error);
      return [];
    }
  }

  async getUserReputation(walletAddress) {
    try {
      if (!this.contracts.votingSystem) {
        console.warn('VotingSystem contract not available');
        return 0;
      }

      const reputation = await this.contracts.votingSystem.userReputation(walletAddress);
      return parseInt(reputation);
    } catch (error) {
      console.error('Error fetching user reputation from blockchain:', error);
      return 0;
    }
  }
}

module.exports = new BlockchainService();
