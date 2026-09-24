import React from 'react';
import { PublicHeader } from '../components/common/PublicHeader';
import { HeroSection } from '../components/common/HeroSection';
import { OpportunitiesSection } from '../components/common/OpportunitiesSection';
import { InternshipsSection } from '../components/common/InternshipsSection';
import { ScholarshipsSection } from '../components/common/ScholarshipsSection';
import { AboutSection } from '../components/common/AboutSection';
import { ContactSection } from '../components/common/ContactSection';
import { Footer } from '../components/common/Footer';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-brand-500 selection:text-white flex flex-col justify-between overflow-x-hidden">
      {/* Public Header Navigation */}
      <PublicHeader />

      {/* Main Continuous Product Journey */}
      <main className="flex-1 space-y-4">
        {/* SECTION 1: Centered Hero */}
        <HeroSection />

        {/* SECTION 2: Opportunities Chapter & 8-Stage Lifecycle */}
        <OpportunitiesSection />

        {/* SECTION 3: Tech Internships Chapter */}
        <InternshipsSection />

        {/* SECTION 4: Scholarships & Document Readiness Chapter */}
        <ScholarshipsSection />

        {/* SECTION 5: About & Technical Architecture Chapter */}
        <AboutSection />

        {/* SECTION 6: Contact & Support Chapter */}
        <ContactSection />
      </main>

      {/* Public Footer */}
      <Footer />
    </div>
  );
};
