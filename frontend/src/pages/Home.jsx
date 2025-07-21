import React, { useEffect, useState } from 'react';
import { 
  ArrowRightIcon, 
  MicrophoneIcon, 
  MapPinIcon, 
  RadioIcon, 
  UsersIcon,
  SpeakerWaveIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { 
  SpeakerWaveIcon as SpeakerWaveIconSolid
} from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { AudioPlayer } from '../components/ui/AudioPlayer';
import { cn } from '../utils/cn';

const FeatureCard = ({ icon, title, description, delay = 0, className }) => (
  <GlassCard 
    className={cn(
      "p-8 group hover:scale-105 transition-all duration-500 cursor-pointer border-0 bg-white/60 dark:bg-gray-900/60",
      className
    )}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="relative">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 via-electric-500 to-frequency-500 flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
        {icon}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500 to-electric-500 opacity-0 group-hover:opacity-20 transition-opacity blur-xl" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  </GlassCard>
);

const StatCard = ({ number, label, icon, delay = 0 }) => (
  <GlassCard 
    className="p-6 text-center group cursor-pointer bg-white/40 dark:bg-gray-900/40 border-0"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-electric-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
      {number}
    </div>
    <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  </GlassCard>
);

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Add body classes for gradient background
    document.body.classList.add(
      'bg-gradient-to-br', 
      'from-gray-50', 
      'via-blue-50', 
      'to-purple-50', 
      'dark:from-gray-900', 
      'dark:via-gray-900', 
      'dark:to-purple-900/20'
    );
    
    return () => {
      document.body.classList.remove(
        'bg-gradient-to-br', 
        'from-gray-50', 
        'via-blue-50', 
        'to-purple-50', 
        'dark:from-gray-900', 
        'dark:via-gray-900', 
        'dark:to-purple-900/20'
      );
    };
  }, []);

  const features = [
    {
      icon: <MapPinIcon className="w-8 h-8" />,
      title: "Interactive 3D Map",
      description: "Explore field recordings in stunning 3D environments with spatial audio positioning and real-time visualizations."
    },
    {
      icon: <SpeakerWaveIcon className="w-8 h-8" />,
      title: "Immersive Audio",
      description: "Experience high-quality spatial audio with advanced visualizations and real-time frequency analysis."
    },
    {
      icon: <GlobeAltIcon className="w-8 h-8" />,
      title: "Decentralized Network",
      description: "Built on blockchain technology for transparent licensing, ownership, and community governance."
    },
    {
      icon: <UsersIcon className="w-8 h-8" />,
      title: "Community Driven",
      description: "Join a global community of field recording enthusiasts, sound artists, and audio explorers."
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      title: "Secure & Verified",
      description: "All recordings are cryptographically verified with clear attribution and licensing information."
    },
    {
      icon: <LightBulbIcon className="w-8 h-8" />,
      title: "AI-Powered Discovery",
      description: "Discover new sounds through intelligent recommendations and advanced audio analysis."
    }
  ];

  const sampleRecordings = [
    {
      id: 1,
      title: "Morning Forest Ambience",
      artist: "NatureSounds",
      src: "/api/audio/sample1.mp3",
      duration: 180
    },
    {
      id: 2,
      title: "City Rain Patterns",
      artist: "UrbanField",
      src: "/api/audio/sample2.mp3", 
      duration: 245
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-electric-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-frequency-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto text-center mb-32 relative z-10">
        <div className={cn(
          "transition-all duration-1000 transform",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          {/* Status Badge */}
          <div className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-primary-200/50 dark:border-primary-700/50 mb-8 shadow-lg">
            <div className="relative flex h-3 w-3 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <span className="text-gray-700 dark:text-gray-300">🎵 Live streaming now - Join 2,847 listeners</span>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 dark:text-white mb-8 leading-none">
            The Future of{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-primary-600 via-electric-600 to-frequency-600 bg-clip-text text-transparent">
                Audio
              </span>
              <div className="absolute -inset-2 bg-gradient-to-r from-primary-600/20 via-electric-600/20 to-frequency-600/20 blur-2xl -z-10" />
            </span>
            <br />
            <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              Exploration
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="mx-auto max-w-3xl text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
            Discover immersive soundscapes from around the world. Create, share, and explore field recordings in a 
            <span className="font-semibold text-primary-600 dark:text-primary-400"> decentralized ecosystem</span> 
            designed for the next generation of audio artists.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/map">
              <Button 
                size="xl" 
                variant="gradient" 
                className="group min-w-64 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <MapPinIcon className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                Explore the Map
                <ArrowRightIcon className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link to="/radio">
              <Button 
                size="xl" 
                variant="outline" 
                className="min-w-64 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90"
              >
                <RadioIcon className="w-6 h-6 mr-3" />
                Listen Live
              </Button>
            </Link>
          </div>

          {/* Sample Audio Players */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {sampleRecordings.map((recording, index) => (
              <div 
                key={recording.id}
                className={cn(
                  "transition-all duration-700 transform",
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                )}
                style={{ animationDelay: `${600 + index * 200}ms` }}
              >
                <AudioPlayer
                  src={recording.src}
                  title={recording.title}
                  artist={recording.artist}
                  compact={true}
                  className="backdrop-blur-md"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto mb-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard 
            number="15K+" 
            label="Recordings" 
            icon={<SpeakerWaveIconSolid className="w-5 h-5" />}
            delay={800}
          />
          <StatCard 
            number="89" 
            label="Countries" 
            icon={<GlobeAltIcon className="w-5 h-5" />}
            delay={900}
          />
          <StatCard 
            number="3.2K" 
            label="Artists" 
            icon={<UsersIcon className="w-5 h-5" />}
            delay={1000}
          />
          <StatCard 
            number="24/7" 
            label="Live Stream" 
            icon={<RadioIcon className="w-5 h-5" />}
            delay={1100}
          />
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto mb-32">
        <div className={cn(
          "text-center mb-16 transition-all duration-1000 transform",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Redefining Audio{' '}
            <span className="bg-gradient-to-r from-primary-600 to-electric-600 bg-clip-text text-transparent">
              Experience
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Built with cutting-edge technology for the most immersive and decentralized field recording platform ever created.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={1200 + index * 100}
              className={cn(
                "transition-all duration-700 transform",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              )}
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto text-center">
        <GlassCard className="p-12 bg-gradient-to-br from-white/80 to-primary-50/80 dark:from-gray-900/80 dark:to-primary-900/20 border-0">
          <div className={cn(
            "transition-all duration-1000 transform",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to{' '}
              <span className="bg-gradient-to-r from-primary-600 to-electric-600 bg-clip-text text-transparent">
                Start Creating?
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
              Join thousands of sound artists and field recording enthusiasts in building the future of decentralized audio.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button 
                  size="xl" 
                  variant="gradient"
                  className="min-w-64 shadow-xl hover:shadow-2xl"
                >
                  <HeartIcon className="w-6 h-6 mr-3" />
                  Join the Community
                </Button>
              </Link>
              
              <Link to="/upload">
                <Button 
                  size="xl" 
                  variant="outline"
                  className="min-w-64 backdrop-blur-md bg-white/80 dark:bg-gray-900/80"
                >
                  <MicrophoneIcon className="w-6 h-6 mr-3" />
                  Upload Recording
                </Button>
              </Link>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
};

export default Home;