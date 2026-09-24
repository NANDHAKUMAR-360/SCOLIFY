import React from 'react';
import { ScolifyLogo } from '../components/common/ScolifyLogo';

export const TermsPage: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
    <header className="bg-white border-b border-slate-100 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <ScolifyLogo variant="transparent" size="sm" contextBg="header" showTagline={false} />
      </div>
    </header>

    <main className="max-w-4xl mx-auto px-4 lg:px-8 py-12 space-y-6 w-full bg-white rounded-3xl border border-slate-100 my-8 shadow-card-soft">
      <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
      <p className="text-xs text-slate-500">Last updated: September 2026</p>

      <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
        <h2 className="text-base font-bold text-slate-800 pt-2">1. Opportunity Verification & Accuracy</h2>
        <p>Scolify verifies scholarship and internship postings using multi-stage provenance checks and duplicate/expiry detection. Students are encouraged to review official sponsor links before final submission.</p>

        <h2 className="text-base font-bold text-slate-800 pt-2">2. Student Responsibilities</h2>
        <p>Students agree to provide accurate canonical academic profile details (GPA, institution, degree level) to ensure deterministic eligibility evaluation integrity.</p>

        <h2 className="text-base font-bold text-slate-800 pt-2">3. Human Approval Requirement</h2>
        <p>All application submissions require explicit student review and manual approval. Scolify is not responsible for unapproved external actions.</p>
      </div>
    </main>

    <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
      <p>Scolify © 2026 • AI-Powered Student Opportunity Intelligence</p>
    </footer>
  </div>
);
