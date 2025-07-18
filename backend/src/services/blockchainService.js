const { ethers } = require('ethers');
const User = require('../models/user');
const Recording = require('../models/recording');

class BlockchainService {
  constructor() {
    this.provider = null;
    this.contracts = {};
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      const mainContractAddress = process.env.SAN2STIC_MAIN_CONTRACT || '0xB80C7e364ea043A2cbA314C5169d990186A4a1bC';
      
      this.initialized = true;
      console.log('Blockchain service initialized with mainnet contract:', mainContractAddress);
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
