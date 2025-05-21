import React from 'react';
import RadioPlayer from '../components/RadioPlayer';

const RadioPage = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
    <div className="w-full max-w-md">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-center text-text-primary">
        Radio <span className="text-primary">San2Stic</span>
      </h1>
      <RadioPlayer />
      <p className="text-center text-text-secondary mt-6 text-sm">
        Branchez-vous sur notre flux live et découvrez de nouveaux sons.
      </p>
    </div>
  </div>
);

export default RadioPage;