import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, CheckCircle2, FileCheck2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const ScholarshipsSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="scholarships" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <Badge variant="brand" icon={<GraduationCap className="w-3.5 h-3.5" />}>
          Scholarship Intelligence
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Find Scholarships That Fit Your Profile
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          Access merit-based, need-based, STEM leadership, and institutional research scholarships verified directly from university portals and official source registries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-brand-600 via-indigo-600 to-cyan-600 text-white shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-yellow-300 font-extrabold text-xs">
            <FileCheck2 className="w-4 h-4" />
            <span>Deterministic Rule Engine Evaluation</span>
          </div>
          <h3 className="text-2xl font-extrabold">Deterministic Eligibility Rule Check</h3>
          <p className="text-xs text-brand-100 leading-relaxed">
            Your GPA, degree, field of study, and country are evaluated deterministically against scholarship criteria. AI explains findings without fabricating eligibility scores.
          </p>
          <div className="p-4 bg-white/10 rounded-2xl border border-white/20 text-xs font-semibold space-y-1">
            <p className="text-emerald-300">✓ Rule 1: GPA Threshold Evaluated (3.80 &gt;= 3.50)</p>
            <p className="text-emerald-300">✓ Rule 2: Degree Category Evaluated (B.S. STEM)</p>
            <p className="text-yellow-300">! Rule 3: Document Vault Transcript Check</p>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-extrabold text-slate-900">
            Document Vault & Readiness Checking
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Scolify cross-references mandatory scholarship requirements with your private document vault to highlight missing transcripts or essay drafts before application deadlines.
          </p>

          <ul className="space-y-3 text-xs text-slate-700 font-semibold">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified university & foundation official portal URLs</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Automated 30-day deadline countdowns & reminders</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>AI drafting support with explicit student approval</span>
            </li>
          </ul>

          <Button
            variant="gradient"
            size="md"
            onClick={() => navigate('/scholarships')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Explore Verified Scholarships
          </Button>
        </div>
      </div>
    </section>
  );
};
