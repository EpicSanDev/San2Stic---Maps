import { ethers } from 'ethers';

const CONTRACTS = {
  SAN2STIC_MAP: '0x...',
  RECORDING_MANAGER: '0x...',
  LICENSE_MANAGER: '0x...',
  VOTING_SYSTEM: '0x...'
};

const CHAIN_CONFIG = {
  chainId: '0x14A34',
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org'],
};

export class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
  }

  async connectWallet() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      await this.switchToBaseNetwork();
      await this.initializeContracts();
      
      return await this.signer.getAddress();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async switchToBaseNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_CONFIG.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [CHAIN_CONFIG],
        });
      } else {
        throw switchError;
      }
    }
  }

  async initializeContracts() {
    this.contracts = {
      san2sticMap: null,
      recordingManager: null,
      licenseManager: null,
      votingSystem: null
    };
  }

  async registerUser(username) {
    if (!this.contracts.san2sticMap) {
      throw new Error('Contract not initialized');
    }
    
    const tx = await this.contracts.san2sticMap.registerUser(username);
    return await tx.wait();
  }

  async addRecording(recordingData) {
    if (!this.contracts.recordingManager) {
      throw new Error('Contract not initialized');
    }
    
    const {
      title,
      description,
      ipfsHash,
      latitude,
      longitude,
      tags,
      duration,
      quality,
      equipment,
      license
    } = recordingData;

    const tx = await this.contracts.recordingManager.addRecording(
      title,
      description,
      ipfsHash,
      Math.floor(latitude * 1000000),
      Math.floor(longitude * 1000000),
      tags,
      duration,
      quality,
      equipment,
      license
    );
    
    return await tx.wait();
  }

  async voteOnRecording(recordingId, isUpvote, creatorAddress) {
    if (!this.contracts.votingSystem) {
      throw new Error('Contract not initialized');
    }
    
    const tx = await this.contracts.votingSystem.voteOnRecording(
      recordingId,
      isUpvote,
      creatorAddress
    );
    
    return await tx.wait();
  }

  async getRecordingsByLocation(minLat, maxLat, minLng, maxLng, offset = 0, limit = 50) {
    if (!this.contracts.recordingManager) {
      throw new Error('Contract not initialized');
    }
    
    return await this.contracts.recordingManager.getRecordingsByLocation(
      Math.floor(minLat * 1000000),
      Math.floor(maxLat * 1000000),
      Math.floor(minLng * 1000000),
      Math.floor(maxLng * 1000000),
      offset,
      limit
    );
  }

  isConnected() {
    return this.signer !== null;
  }

  async getAddress() {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    return await this.signer.getAddress();
  }
}

export const web3Service = new Web3Service();
