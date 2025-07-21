import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, CloudArrowUpIcon, ServerIcon, SparklesIcon } from '@heroicons/react/24/outline';

const UploadOptionCard = ({ icon, title, description, path, isAdvanced }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(path)}
      className={[
        'relative p-8 rounded-3xl border transition-all duration-300 cursor-pointer group overflow-hidden',
        isAdvanced 
          ? 'bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/30 dark:to-cyan-900/30 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-500/20'
          : 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-xl'
      ].join(' ')}>
      
      {isAdvanced && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-bl-lg rounded-tr-3xl z-10">
          Recommandé
        </div>
      )}

      <div className="relative z-0">
        <div className={`mb-6 w-16 h-16 rounded-2xl flex items-center justify-center ${isAdvanced ? 'bg-gradient-to-br from-indigo-600 to-cyan-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>
        
        <div className={`inline-flex items-center font-semibold text-lg group-hover:translate-x-2 transition-transform duration-300 ${isAdvanced ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'}`}>
          Choisir cette option
          <ArrowRightIcon className="h-5 w-5 ml-2" />
        </div>
      </div>
    </div>
  );
};

const Upload = () => {
  useEffect(() => {
    document.body.classList.add('bg-gradient-to-br', 'from-white', 'to-gray-100', 'dark:from-gray-900', 'dark:to-gray-800');
    return () => {
      document.body.classList.remove('bg-gradient-to-br', 'from-white', 'to-gray-100', 'dark:from-gray-900', 'dark:to-gray-800');
    };
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm font-medium mb-6">
            <CloudArrowUpIcon className="h-4 w-4 mr-2" />
            Partagez votre création
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Choisissez votre méthode d'upload
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Nous offrons deux options pour partager vos paysages sonores, adaptées à vos besoins en matière de stockage et de propriété.
          </p>
        </div>

        {/* Upload Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <UploadOptionCard 
            icon={<ServerIcon className="h-8 w-8" />}
            title="Upload Classique"
            description="Stockage simple et rapide sur nos serveurs. Idéal pour un partage facile et immédiat."
            path="#" // Lien désactivé pour le moment
            isAdvanced={false}
          />
          <UploadOptionCard 
            icon={<SparklesIcon className="h-8 w-8" />}
            title="Upload Avancé (Web3)"
            description="Stockage décentralisé sur IPFS et création d'un NFT pour prouver la propriété. Sécurisé et pérenne."
            path="/advanced"
            isAdvanced={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Upload;
