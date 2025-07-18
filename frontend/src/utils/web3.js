import { ethers } from 'ethers';

const CONTRACTS = {
  SAN2STIC_MAP_MAIN: '0x34b52da97a0e0fd89a79217c4b934e8af4f4d874',
  SAN2STIC_MAP: '0xb80c7e364ea043a2cba314c5169d990186a4a1bc',
  RECORDING_MANAGER: '0x114a7e7fb13d65ad3dabbc9874ba2dbc4fe35723',
  LICENSE_MANAGER: '0x44d7653f0ebae21cb68841eed645be4d0cd239f8',
  VOTING_SYSTEM: '0xc40456ce14809c5e346759a600222ae9229d594a'
};

const CHAIN_CONFIG = {
  chainId: '0x2105',
  chainName: 'Base',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://mainnet.base.org'],
  blockExplorerUrls: ['https://basescan.org'],
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
