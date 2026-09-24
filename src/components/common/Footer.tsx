import React from 'react';
import { Link } from 'react-router-dom';
import { ScolifyLogo } from './ScolifyLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
        <div className="md:col-span-2 space-y-4">
          <ScolifyLogo variant="transparent" size="sm" contextBg="light" showTagline={false} />
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm font-medium">
            Scolify is an AI-powered student opportunity intelligence platform dedicated to verifying, organizing, and preparing student applications for scholarships and tech internships.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <p className="font-extrabold uppercase tracking-wider text-slate-900">Product</p>
          <ul className="space-y-2 text-slate-600 font-medium">
            <li><Link to="/opportunities" className="hover:text-brand-600">Opportunity Feed</Link></li>
            <li><Link to="/scholarships" className="hover:text-brand-600">Scholarships</Link></li>
            <li><Link to="/internships" className="hover:text-brand-600">Tech Internships</Link></li>
            <li><Link to="/ai-assistant" className="hover:text-brand-600">AI Assistant</Link></li>
          </ul>
        </div>

        <div className="space-y-3 text-xs">
          <p className="font-extrabold uppercase tracking-wider text-slate-900">Company</p>
          <ul className="space-y-2 text-slate-600 font-medium">
            <li><a href="#about" className="hover:text-brand-600">About Scolify</a></li>
            <li><a href="#verification" className="hover:text-brand-600">Verification Engine</a></li>
            <li><a href="#faq" className="hover:text-brand-600">Student FAQ</a></li>
            <li><Link to="/contact" className="hover:text-brand-600">Contact Support</Link></li>
          </ul>
        </div>

        <div className="space-y-3 text-xs">
          <p className="font-extrabold uppercase tracking-wider text-slate-900">Account</p>
          <ul className="space-y-2 text-slate-600 font-medium">
            <li><Link to="/login" className="hover:text-brand-600">Sign In</Link></li>
            <li><Link to="/register" className="hover:text-brand-600">Create Account</Link></li>
            <li><Link to="/dashboard" className="hover:text-brand-600">Student Dashboard</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
        <p>Scolify © 2026 • AI-Powered Student Opportunity Intelligence • "Find Your Next Opportunity"</p>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
          <Link to="/terms" className="hover:underline">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};
