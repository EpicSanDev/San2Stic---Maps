import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWeb3 } from '../hooks/useWeb3';
import { ethers } from 'ethers';

const Signup = () => {
  const navigate = useNavigate();
  const { walletLogin, loading, error, setError, user } = useAuth();
  const { connectWallet, isConnected, address } = useWeb3();
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleWalletSignup = async () => {
    setLocalLoading(true);
    setError(null);
    try {
      await connectWallet();
    } catch (err) {
      setError('Failed to connect wallet');
      setLocalLoading(false);
      return;
    }
    if (isConnected && address) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const message = `Signup to San2Stic at ${new Date().toISOString()}`;
        const signature = await signer.signMessage(message);
        await walletLogin(address, signature, message);
      } catch (err) {
        setError('Wallet signup failed');
        console.error(err);
      }
    }
    setLocalLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 sm:p-10 bg-white shadow-2xl rounded-xl">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-text-primary">
            S'inscrire avec votre wallet
          </h1>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative transition-opacity duration-300 ease-in-out" role="alert">
            <strong className="font-bold">Erreur: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div>
          <button
            onClick={handleWalletSignup}
            disabled={loading || localLoading}
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary/50 transition-all duration-300 ease-in-out ${loading || localLoading ? 'animate-pulse' : ''}`}
          >
            {loading || localLoading ? (
              <>
                <svg aria-hidden="true" className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Inscription en cours...
              </>
            ) : 'S\'inscrire avec Metamask'}
          </button>
        </div>
        <div className="text-sm text-center">
          <p className="text-text-secondary">
            Déjà un compte?{' '}
            <Link to="/login" className="font-medium text-secondary hover:text-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all duration-300 ease-in-out">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;