import React, { useEffect } from 'react';
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="group"
            >
              <Link to="/radio">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Écouter la radio
              </Link>
            </Button>
          </div>
          
          {/* Hero Image/Video Placeholder */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 p-1">
            <div className="aspect-video w-full bg-neutral-200 dark:bg-neutral-800 rounded-2xl flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
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
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            title="Carte interactive"
            description="Naviguez sur une carte interactive et découvrez des enregistrements géolocalisés."
          />
          <FeatureCard
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            }
            title="Radio en direct"
            description="Écoutez notre sélection musicale en continu, 24h/24."
            className="md:translate-y-6"
          />
          <FeatureCard
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
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