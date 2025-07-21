import React, { useEffect } from 'react';
import { ArrowRightIcon, PlayCircleIcon, MicrophoneIcon, MapPinIcon, RadioIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

const FeatureCard = ({ icon, title, description, className }) => (
  <div className={cn("p-6 rounded-2xl bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 transition-all hover:shadow-md hover:border-primary-200 dark:hover:border-primary-900/50", className)}>
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">{title}</h3>
    <p className="text-neutral-600 dark:text-neutral-400">{description}</p>
  </div>
);

const Home = () => {
  useEffect(() => {
    // Ajouter la classe au body pour le dégradé de fond
    document.body.classList.add('bg-gradient-to-br', 'from-white', 'to-neutral-100', 'dark:from-neutral-900', 'dark:to-neutral-800');
    
    return () => {
      // Nettoyer les classes au démontage
      document.body.classList.remove('bg-gradient-to-br', 'from-white', 'to-neutral-100', 'dark:from-neutral-900', 'dark:to-neutral-800');
    };
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto text-center mb-20 md:mb-28">
        <div className="relative">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 mb-6">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            Écoutez la radio en direct
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6">
            Découvrez des paysages sonores{' '}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              uniques
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 mb-10">
            Plongez dans une expérience auditive immersive avec San2Stic. Explorez des enregistrements de terrain, écoutez notre radio en direct et partagez vos propres créations sonores avec la communauté.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Button 
              asChild 
              size="lg"
              className="group"
            >
              <Link to="/map">
                Explorer la carte
                <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="group"
            >
              <Link to="/radio">
                <PlayCircleIcon className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                Écouter la radio
              </Link>
            </Button>
          </div>
          
          {/* Hero Image/Video Placeholder */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 p-1">
            <div className="aspect-video w-full bg-neutral-200 dark:bg-neutral-800 rounded-2xl flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600">
                  <MicrophoneIcon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">Expérience audio immersive</h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">Découvrez des paysages sonores uniques à travers le monde</p>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-primary-500/10 blur-3xl"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-secondary-500/10 blur-3xl"></div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="max-w-7xl mx-auto mb-20 md:mb-28">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Une nouvelle façon d'explorer le son
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            San2Stic combine cartographie interactive et expérience audio pour une découverte unique des paysages sonores.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<MapPinIcon className="h-6 w-6" />}
            title="Carte interactive"
            description="Naviguez sur une carte interactive et découvrez des enregistrements géolocalisés."
          />
          <FeatureCard
            icon={<RadioIcon className="h-6 w-6" />}
            title="Radio en direct"
            description="Écoutez notre sélection musicale en continu, 24h/24."
            className="md:translate-y-6"
          />
          <FeatureCard
            icon={<UsersIcon className="h-6 w-6" />}
            title="Communauté"
            description="Rejoignez une communauté de passionnés du son et partagez vos créations."
            className="lg:translate-y-12"
          />
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="max-w-4xl mx-auto text-center bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary-500/10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-secondary-500/10 blur-3xl"></div>
        
        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-6">
            Prêt à commencer votre voyage sonore ?
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
            Rejoignez notre communauté et commencez à explorer, écouter et partager des paysages sonores uniques dès aujourd'hui.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" variant="gradient" className="group">
              <Link to="/signup">
                Créer un compte
                <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/map">
                Explorer sans compte
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;