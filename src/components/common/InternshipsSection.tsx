import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const InternshipsSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="internships" className="py-20 px-4 lg:px-8 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <Badge variant="emerald" icon={<Briefcase className="w-3.5 h-3.5" />}>
            Internship Intelligence
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Find Internships That Fit Your Future
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Discover verified tech engineering, AI research, cloud architecture, and business internships from top companies, startups, and research institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-extrabold text-slate-900">
              Verified Technical Roles & Skill Gap Awareness
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Scolify evaluates required technical skills (Python, React, TypeScript, ML, Cloud) against your canonical profile. Identify missing skills before applying.
            </p>

            <ul className="space-y-3 text-xs text-slate-700 font-semibold">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified recruiter corporate domain & official portal links</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Remote & location-based internship filtering</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Risk & duplicate detection to protect against scam listings</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Human Approval Engine — zero silent third-party submissions</span>
              </li>
            </ul>

            <Button
              variant="gradient"
              size="md"
              onClick={() => navigate('/internships')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Explore Tech Internships
            </Button>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Internship Risk & Verification Signals</span>
            </div>
            <h4 className="text-lg font-bold">Verification Engine Safeguards</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every internship posting passes domain validation, duplicate checks, and active deadline expiry evaluation before publishing.
            </p>
            <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 text-xs text-slate-300 space-y-1 font-mono">
              <p className="text-emerald-400">✓ Recruiter Domain: Verified Corporate Portal</p>
              <p>✓ Status: Published & Active</p>
              <p>✓ Duplicate Detector: Unique Listing</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
