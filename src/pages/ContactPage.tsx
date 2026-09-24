import React from 'react';
import { PublicHeader } from '../components/common/PublicHeader';
import { ContactSection } from '../components/common/ContactSection';
import { Footer } from '../components/common/Footer';

export const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      <PublicHeader />
      <main className="flex-1">
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};
