import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Mail, BookOpen, MessageSquare, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ScolifyLogo } from '../components/common/ScolifyLogo';

export const SupportPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      <header className="bg-white border-b border-slate-100 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <ScolifyLogo variant="transparent" size="sm" contextBg="header" showTagline={false} />
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 lg:px-8 py-12 space-y-8 w-full">
        <div className="text-center space-y-3">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl w-fit mx-auto">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Scolify Student Support & Help Center</h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Find answers to common questions about opportunity verification, account security, eligibility rule checks, and document vault privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card isHoverable className="p-6 space-y-3">
            <BookOpen className="w-6 h-6 text-brand-600" />
            <h3 className="font-bold text-sm text-slate-900">Verification Guide</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Learn how our multi-stage pipeline verifies scholarship registries and recruiter credentials.</p>
          </Card>

          <Card isHoverable className="p-6 space-y-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Account & RLS Privacy</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Understand how your canonical student profile and document vault are isolated in Supabase.</p>
          </Card>

          <Card isHoverable className="p-6 space-y-3">
            <MessageSquare className="w-6 h-6 text-violet-600" />
            <h3 className="font-bold text-sm text-slate-900">AI Assistance Ethics</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Review our Human Approval Engine standards for AI drafting and eligibility checks.</p>
          </Card>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-card-soft text-center space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Need additional assistance?</h3>
          <p className="text-xs text-slate-500">Contact our student support team for account or profile technical guidance.</p>
          <a href="mailto:support@scolify.org" className="inline-block">
            <Button variant="gradient" size="sm" leftIcon={<Mail className="w-4 h-4" />}>
              Contact support@scolify.org
            </Button>
          </a>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>Scolify © 2026 • AI-Powered Student Opportunity Intelligence</p>
      </footer>
    </div>
  );
};
