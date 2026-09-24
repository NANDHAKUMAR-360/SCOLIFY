import React from 'react';
import { PublicHeader } from '../components/common/PublicHeader';
import { AboutSection } from '../components/common/AboutSection';
import { Footer } from '../components/common/Footer';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      <PublicHeader />
      <main className="flex-1">
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};
