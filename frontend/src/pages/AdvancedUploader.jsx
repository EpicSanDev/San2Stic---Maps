import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RecordingForm from '../components/RecordingForm';
import {
  CloudArrowUpIcon,
  MicrophoneIcon,
  MapPinIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import {
  SpeakerWaveIcon,
  GlobeAltIcon
} from '@heroicons/react/24/solid';

const AdvancedUploader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const steps = [
    {
      icon: MicrophoneIcon,
      title: 'Enregistrez',
      description: 'Capturez les sons uniques de votre environnement'
    },
    {
      icon: CloudArrowUpIcon,
      title: 'Téléchargez',
      description: 'Partagez votre création avec la communauté'
    },
    {
      icon: GlobeAltIcon,
      title: 'Explorez',
      description: 'Découvrez votre enregistrement sur la carte mondiale'
    }
  ];

  const benefits = [
    {
      icon: SparklesIcon,
      title: 'Stockage décentralisé',
      description: 'Vos enregistrements sont stockés de manière sécurisée sur IPFS'
    },
    {
      icon: CheckCircleIcon,
      title: 'Propriété blockchain',
      description: 'Prouvez votre propriété avec la technologie blockchain'
    },
    {
      icon: SpeakerWaveIcon,
      title: 'Qualité préservée',
      description: 'Formats audio haute qualité supportés'
    }
  ];

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => setShowForm(false)}
            className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
          >
            <ArrowRightIcon className="h-4 w-4 mr-2 rotate-180" />
            Retour à l'aperçu
          </button>
          
          <RecordingForm 
            onSuccess={() => navigate('/profile')} 
            onCancel={() => setShowForm(false)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="flex space-x-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={`w-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse`} style={{
                    height: `${Math.random() * 40 + 20}px`,
                    animationDelay: `${i * 0.1}s`
                  }}></div>
                ))}
              </div>
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm font-medium mb-6">
                <SparklesIcon className="h-4 w-4 mr-2" />
                Nouveau sur San2Stic
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Partagez vos
                <span className="block bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  Paysages Sonores
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                Transformez les sons de votre environnement en NFT audio uniques. 
                Contribuez à la plus grande carte collaborative de paysages sonores au monde.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white rounded-2xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <CloudArrowUpIcon className="h-6 w-6 mr-3" />
                  Commencer l'upload
                </button>
                
                <button
                  onClick={() => navigate('/map')}
                  className="inline-flex items-center px-8 py-4 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl font-semibold text-lg transition-all duration-200 border border-gray-200 dark:border-gray-600 backdrop-blur-sm"
                >
                  <MapPinIcon className="h-6 w-6 mr-3" />
                  Explorer la carte
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Comment ça marche ?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="relative">
                  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-xl p-8 text-center h-full">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 dark:from-indigo-400/20 dark:to-cyan-400/20 rounded-2xl" />
                      <div className="relative p-4 bg-white/60 dark:bg-gray-700/60 rounded-2xl w-fit mx-auto mb-6">
                        <IconComponent className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                    
                    <div className="absolute top-4 right-4 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {step.description}
                    </p>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRightIcon className="h-6 w-6 text-indigo-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Pourquoi choisir San2Stic ?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                      <IconComponent className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à contribuer ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Rejoignez des milliers de créateurs qui partagent leurs paysages sonores uniques.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <CloudArrowUpIcon className="h-6 w-6 mr-3" />
              Télécharger maintenant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedUploader;