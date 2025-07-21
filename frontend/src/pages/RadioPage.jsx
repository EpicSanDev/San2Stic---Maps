import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RadioPlayer from '../components/RadioPlayer';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ClockIcon, HeartIcon, ShareIcon, ArrowDownTrayIcon, UsersIcon, MicrophoneIcon, MapPinIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';

const WaveAnimation = ({ isPlaying }) => (
  <div className="flex items-center justify-center space-x-1 h-16">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className={cn(
          "w-1 bg-gradient-to-t from-primary-600 to-secondary-600 rounded-full transition-all duration-300",
          isPlaying ? "animate-pulse" : "opacity-30"
        )}
        style={{
          height: isPlaying ? `${20 + Math.sin(Date.now() / 1000 + i) * 15}px` : '8px',
          animationDelay: `${i * 0.1}s`,
          animationDuration: `${1 + i * 0.1}s`
        }}
      />
    ))}
  </div>
);

const ProgramSchedule = () => {
  const schedule = [
    { time: '06:00', show: 'Réveil Sonore', description: 'Ambiances matinales douces' },
    { time: '09:00', show: 'Field Recordings', description: 'Paysages sonores du monde' },
    { time: '12:00', show: 'Pause Déjeuner', description: 'Sélection éclectique' },
    { time: '15:00', show: 'Découvertes', description: 'Nouveaux artistes et créations' },
    { time: '18:00', show: 'Soirée Ambient', description: 'Atmosphères contemplatives' },
    { time: '21:00', show: 'Nocturne', description: 'Sons pour la nuit' }
  ];

  const currentHour = new Date().getHours();
  const getCurrentShow = () => {
    for (let i = schedule.length - 1; i >= 0; i--) {
      const showHour = parseInt(schedule[i].time.split(':')[0]);
      if (currentHour >= showHour) {
        return i;
      }
    }
    return schedule.length - 1;
  };

  const currentShowIndex = getCurrentShow();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ClockIcon className="h-5 w-5 text-primary-600" />
          <span>Programme du jour</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {schedule.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                index === currentShowIndex
                  ? "bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
                  : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              )}
            >
              <div className={cn(
                "text-sm font-mono font-medium",
                index === currentShowIndex ? "text-primary-600 dark:text-primary-400" : "text-neutral-600 dark:text-neutral-400"
              )}>
                {item.time}
              </div>
              <div className="flex-1">
                <div className={cn(
                  "font-medium",
                  index === currentShowIndex ? "text-primary-900 dark:text-primary-100" : "text-neutral-900 dark:text-white"
                )}>
                  {item.show}
                  {index === currentShowIndex && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                      En direct
                    </span>
                  )}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const StatsCard = ({ icon, title, value, description }) => (
  <Card className="text-center">
    <CardContent className="p-6">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600">
        {icon}
      </div>
      <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">{value}</div>
      <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{title}</div>
      <div className="text-xs text-neutral-500 dark:text-neutral-400">{description}</div>
    </CardContent>
  </Card>
);

const RadioPage = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [listeners, setListeners] = useState(42);

  useEffect(() => {
    // Simuler les changements du nombre d'auditeurs
    const interval = setInterval(() => {
      setListeners(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Ajouter la classe au body pour le dégradé de fond
    document.body.classList.add('bg-gradient-to-br', 'from-neutral-50', 'via-white', 'to-primary-50', 'dark:from-neutral-900', 'dark:via-neutral-800', 'dark:to-neutral-900');
    
    return () => {
      // Nettoyer les classes au démontage
      document.body.classList.remove('bg-gradient-to-br', 'from-neutral-50', 'via-white', 'to-primary-50', 'dark:from-neutral-900', 'dark:via-neutral-800', 'dark:to-neutral-900');
    };
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 mb-6">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            En direct maintenant
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6">
            Radio{' '}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              San2Stic
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 mb-8">
            Plongez dans un univers sonore unique. Écoutez notre sélection de paysages sonores, field recordings et créations audio en direct.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Player Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Radio Player */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-2xl">
                <div className="text-center mb-8">
                  <WaveAnimation isPlaying={isPlaying} />
                </div>
                
                <div className="max-w-md mx-auto">
                  <RadioPlayer onPlayStateChange={setIsPlaying} />
                </div>
                
                <div className="mt-8 flex justify-center space-x-4">
                  <Button variant="outline" size="sm">
                    <HeartIcon className="h-4 w-4 mr-2" />
                    Favori
                  </Button>
                  <Button variant="outline" size="sm">
                    <ShareIcon className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                  <Button variant="outline" size="sm">
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Télécharger l'app
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <StatsCard
                icon={<UsersIcon className="h-6 w-6" />}
                title="Auditeurs en direct"
                value={listeners}
                description="Connectés maintenant"
              />
              <StatsCard
                icon={<MicrophoneIcon className="h-6 w-6" />}
                title="Enregistrements"
                value="247"
                description="Dans notre collection"
              />
              <StatsCard
                icon={<ClockIcon className="h-6 w-6" />}
                title="Diffusion"
                value="24/7"
                description="Sans interruption"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProgramSchedule />
            
            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Liens rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/map')}>
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  Explorer la carte
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/upload')}>
                  <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                  Partager un son
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Rejoindre la communauté
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadioPage;