import React from 'react';
import { ScolifyLogo } from '../components/common/ScolifyLogo';

export const PrivacyPage: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
    <header className="bg-white border-b border-slate-100 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <ScolifyLogo variant="transparent" size="sm" contextBg="header" showTagline={false} />
      </div>
    </header>

    <main className="max-w-4xl mx-auto px-4 lg:px-8 py-12 space-y-6 w-full bg-white rounded-3xl border border-slate-100 my-8 shadow-card-soft">
      <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
      <p className="text-xs text-slate-500">Last updated: September 2026</p>

      <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
        <h2 className="text-base font-bold text-slate-800 pt-2">1. Data Isolation & Security</h2>
        <p>Scolify stores canonical student profile information, education records, verified skills, and document vault assets securely on Supabase PostgreSQL with strict Row Level Security (RLS) policies enabled.</p>

        <h2 className="text-base font-bold text-slate-800 pt-2">2. How Student Information is Used</h2>
        <p>Your academic profile metrics (GPA, field of study, degree level) are evaluated deterministically against verified opportunity requirement rules. We do not sell your personal information to third parties.</p>

        <h2 className="text-base font-bold text-slate-800 pt-2">3. AI Assistance & Human Control</h2>
        <p>AI processing is performed server-side. No consequential application submission is performed automatically without your explicit review and approval.</p>
      </div>
    </main>

    <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
      <p>Scolify © 2026 • AI-Powered Student Opportunity Intelligence</p>
    </footer>
  </div>
);
