import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWeb3 } from '../hooks/useWeb3';
import { ethers } from 'ethers';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { cn } from '../utils/cn';

const WalletOption = ({ icon, name, description, onClick, disabled, isLoading }) => (
  <Button
    variant="outline"
    className="w-full p-6 h-auto flex items-center space-x-4 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 group"
    onClick={onClick}
    disabled={disabled}
  >
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center group-hover:from-primary-100 group-hover:to-primary-200 dark:group-hover:from-primary-900/50 dark:group-hover:to-primary-800/50 transition-all duration-200">
      {isLoading ? (
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      ) : (
        icon
      )}
    </div>
    <div className="flex-1 text-left">
      <div className="font-semibold text-neutral-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
        {name}
      </div>
      <div className="text-sm text-neutral-600 dark:text-neutral-400">
        {description}
      </div>
    </div>
    <svg className="h-5 w-5 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </Button>
);

const BenefitCard = ({ icon, title, description }) => (
  <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border border-primary-100 dark:border-primary-800">
    <div className="flex items-start space-x-3">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <div>
        <div className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">{title}</div>
        <div className="text-xs text-neutral-600 dark:text-neutral-400">{description}</div>
      </div>
    </div>
  </div>
);

const Signup = () => {
  const navigate = useNavigate();
  const { walletLogin, loading, error, setError, user } = useAuth();
  const { connectWallet, isConnected, address } = useWeb3();
  const [localLoading, setLocalLoading] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Ajouter la classe au body pour le dégradé de fond
    document.body.classList.add('bg-gradient-to-br', 'from-white', 'via-neutral-50', 'to-secondary-50', 'dark:from-neutral-900', 'dark:via-neutral-800', 'dark:to-neutral-900');
    
    return () => {
      // Nettoyer les classes au démontage
      document.body.classList.remove('bg-gradient-to-br', 'from-white', 'via-neutral-50', 'to-secondary-50', 'dark:from-neutral-900', 'dark:via-neutral-800', 'dark:to-neutral-900');
    };
  }, []);

  const handleWalletSignup = async (walletType = 'metamask') => {
    setSelectedWallet(walletType);
    setLocalLoading(true);
    setError(null);
    
    try {
      await connectWallet();
    } catch (err) {
      setError('Échec de la connexion au portefeuille. Assurez-vous qu\'il est installé et déverrouillé.');
      setLocalLoading(false);
      setSelectedWallet(null);
      return;
    }
    
    if (isConnected && address) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const message = `Inscription à San2Stic le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`;
        const signature = await signer.signMessage(message);
        await walletLogin(address, signature, message);
      } catch (err) {
        setError('Échec de la signature. Veuillez réessayer.');
        console.error(err);
      }
    }
    
    setLocalLoading(false);
    setSelectedWallet(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Benefits & Info */}
          <div className="text-center lg:text-left">
            <div className="mb-8">
              <Link to="/" className="inline-flex items-center space-x-3 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">S2S</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  San2Stic
                </span>
              </Link>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6">
              Rejoignez la{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                révolution sonore
              </span>
            </h1>
            
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl">
              Créez votre compte et découvrez un univers de paysages sonores uniques. Partagez vos créations, explorez la carte mondiale et connectez-vous avec une communauté passionnée.
            </p>
            
            {/* Benefits */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Pourquoi rejoindre San2Stic ?</h3>
              <div className="grid gap-4">
                <BenefitCard
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />}
                  title="Explorez le monde sonore"
                  description="Découvrez des enregistrements géolocalisés du monde entier"
                />
                <BenefitCard
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />}
                  title="Partagez vos créations"
                  description="Téléversez et monétisez vos propres enregistrements"
                />
                <BenefitCard
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
                  title="Rejoignez la communauté"
                  description="Connectez-vous avec des créateurs du monde entier"
                />
                <BenefitCard
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />}
                  title="Radio en direct"
                  description="Écoutez notre sélection 24h/24 et 7j/7"
                />
              </div>
            </div>
          </div>
          
          {/* Right Column - Signup Form */}
          <div className="max-w-md mx-auto w-full">
            <Card className="shadow-2xl border-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
                  Créer un compte
                </CardTitle>
                <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                  Choisissez votre portefeuille pour commencer
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {error && (
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-start space-x-3">
                      <svg className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <h4 className="font-medium text-red-800 dark:text-red-200">Erreur d'inscription</h4>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <WalletOption
                    icon={
                      <svg className="h-6 w-6 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.763 10.89l-1.745-8.553C21.87 1.357 21.045.5 20.067.5H3.933C2.955.5 2.13 1.357 1.982 2.337L.237 10.89c-.148.98.677 1.837 1.655 1.837h.91v7.773c0 1.357 1.1 2.5 2.455 2.5h13.486c1.355 0 2.455-1.143 2.455-2.5V12.727h.91c.978 0 1.803-.857 1.655-1.837zM12 15.909c-1.355 0-2.455-1.143-2.455-2.5s1.1-2.5 2.455-2.5 2.455 1.143 2.455 2.5-1.1 2.5-2.455 2.5z"/>
                      </svg>
                    }
                    name="MetaMask"
                    description="Portefeuille le plus populaire"
                    onClick={() => handleWalletSignup('metamask')}
                    disabled={loading || localLoading}
                    isLoading={selectedWallet === 'metamask' && localLoading}
                  />
                  
                  <WalletOption
                    icon={
                      <svg className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 16.894L12 12l-5.894 4.894A9.928 9.928 0 0112 22a9.928 9.928 0 015.894-5.106z"/>
                      </svg>
                    }
                    name="WalletConnect"
                    description="Connectez n'importe quel portefeuille"
                    onClick={() => handleWalletSignup('walletconnect')}
                    disabled={true} // Désactivé pour l'instant
                    isLoading={false}
                  />
                  
                  <WalletOption
                    icon={
                      <svg className="h-6 w-6 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z"/>
                      </svg>
                    }
                    name="Coinbase Wallet"
                    description="Portefeuille Coinbase"
                    onClick={() => handleWalletSignup('coinbase')}
                    disabled={true} // Désactivé pour l'instant
                    isLoading={false}
                  />
                </div>
                
                <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                    Déjà un compte ?{' '}
                    <Link 
                      to="/login" 
                      className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                    >
                      Se connecter
                    </Link>
                  </p>
                </div>
                
                <div className="text-xs text-center text-neutral-500 dark:text-neutral-400">
                  En créant un compte, vous acceptez nos{' '}
                  <a href="#" className="underline hover:text-neutral-700 dark:hover:text-neutral-300">conditions d'utilisation</a>
                  {' '}et notre{' '}
                  <a href="#" className="underline hover:text-neutral-700 dark:hover:text-neutral-300">politique de confidentialité</a>.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;