import { useState, useEffect, useCallback } from 'react';
import { web3Service } from '../utils/web3';

export const useWeb3 = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userAddress = await web3Service.connectWallet();
      setAddress(userAddress);
      setIsConnected(true);
      localStorage.setItem('walletConnected', 'true');
    } catch (err) {
      setError(err.message);
      console.error('Failed to connect wallet:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    localStorage.removeItem('walletConnected');
  }, []);

  const registerUser = useCallback(async (username) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const tx = await web3Service.registerUser(username);
      return tx;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  const addRecording = useCallback(async (recordingData) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const tx = await web3Service.addRecording(recordingData);
      return tx;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  const voteOnRecording = useCallback(async (recordingId, isUpvote, creatorAddress) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const tx = await web3Service.voteOnRecording(recordingId, isUpvote, creatorAddress);
      return tx;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected');
    if (wasConnected && window.ethereum) {
      connectWallet();
    }
  }, [connectWallet]);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAddress(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [disconnectWallet]);

  return {
    isConnected,
    address,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    registerUser,
    addRecording,
    voteOnRecording,
    setError
  };
};
