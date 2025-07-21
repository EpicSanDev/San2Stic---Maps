import { ethers } from 'ethers';
import San2SticMapMainABI from '../contracts/San2SticMapMain.json';
import San2SticMapABI from '../contracts/San2SticMap.json';
import RecordingManagerABI from '../contracts/RecordingManager.json';
import LicenseManagerABI from '../contracts/LicenseManager.json';
import VotingSystemABI from '../contracts/VotingSystem.json';

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
      san2sticMapMain: new ethers.Contract(CONTRACTS.SAN2STIC_MAP_MAIN, San2SticMapMainABI.abi, this.signer),
      san2sticMap: new ethers.Contract(CONTRACTS.SAN2STIC_MAP, San2SticMapABI.abi, this.signer),
      recordingManager: new ethers.Contract(CONTRACTS.RECORDING_MANAGER, RecordingManagerABI.abi, this.signer),
      licenseManager: new ethers.Contract(CONTRACTS.LICENSE_MANAGER, LicenseManagerABI.abi, this.signer),
      votingSystem: new ethers.Contract(CONTRACTS.VOTING_SYSTEM, VotingSystemABI.abi, this.signer)
    };
  }

  async registerUser(username) {
    if (!this.contracts.san2sticMap) {
      throw new Error('Contract not initialized');
    }
    
    const tx = await this.contracts.san2sticMap.registerUser(username);
    return await tx.wait();
  }

  async uploadAudioToIPFS(audioFile) {
    if (!this.signer) {
      throw new Error('Wallet non connectée');
    }

    const formData = new FormData();
    formData.append('file', audioFile);
    
    const signature = await this.signer.signMessage('Sign to upload to IPFS');
    
    const response = await fetch(`${process.env.REACT_APP_API_URL}/ipfs/upload`, {
      method: 'POST',
      headers: {
        'X-Signature': signature,
        'X-Address': await this.getAddress()
      },
      body: formData
    });

    if (!response.ok) throw new Error('Échec upload IPFS');
    return await response.json();
  }

  async addRecording(recordingData) {
    if (!this.contracts.recordingManager) {
      throw new Error('Contract non initialisé');
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

  async getRecordingsByLocationOptimized(minLat, maxLat, minLng, maxLng, offset = 0, limit = 50) {
    if (!this.contracts.san2sticMapMain) {
      throw new Error('Contract not initialized');
    }
    
    return await this.contracts.san2sticMapMain.getRecordingsByLocationOptimized(
      Math.floor(minLat * 1000000),
      Math.floor(maxLat * 1000000),
      Math.floor(minLng * 1000000),
      Math.floor(maxLng * 1000000),
      offset,
      limit
    );
  }

  async getRecordingWithAllData(recordingId) {
    if (!this.contracts.san2sticMapMain) {
      throw new Error('Contract not initialized');
    }
    
    return await this.contracts.san2sticMapMain.getRecordingWithAllData(recordingId);
  }

  async getUserDashboard(userAddress) {
    if (!this.contracts.san2sticMapMain) {
      throw new Error('Contract not initialized');
    }
    
    return await this.contracts.san2sticMapMain.getUserDashboard(userAddress);
  }

  async getSystemStats() {
    if (!this.contracts.san2sticMapMain) {
      throw new Error('Contract not initialized');
    }
    
    return await this.contracts.san2sticMapMain.getSystemStats();
  }

  async batchVoteOnRecordings(recordingIds, isUpvotes) {
    if (!this.contracts.san2sticMapMain) {
      throw new Error('Contract not initialized');
    }
    
    const tx = await this.contracts.san2sticMapMain.batchVoteOnRecordings(recordingIds, isUpvotes);
    return await tx.wait();
  }

  async batchRateRecordings(recordingIds, ratings) {
    if (!this.contracts.san2sticMapMain) {
      throw new Error('Contract not initialized');
    }
    
    const tx = await this.contracts.san2sticMapMain.batchRateRecordings(recordingIds, ratings);
    return await tx.wait();
  }

  async batchSetRecordingLicenses(recordingIds, licenseTypes, attributions) {
    if (!this.contracts.san2sticMapMain) {
      throw new Error('Contract not initialized');
    }
    
    const tx = await this.contracts.san2sticMapMain.batchSetRecordingLicenses(
      recordingIds, 
      licenseTypes, 
      attributions
    );
    return await tx.wait();
  }

  async registerUserAndAddRecording(userData) {
    if (!this.contracts.san2sticMapMain) {
      throw new Error('Contract not initialized');
    }

    const {
      username,
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
    } = userData;

    const tx = await this.contracts.san2sticMapMain.registerUserAndAddRecording(
      username,
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
