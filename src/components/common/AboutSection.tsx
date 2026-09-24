import React from 'react';
import { Info, Database, Cpu, UserCheck } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 px-4 lg:px-8 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <Badge variant="brand" icon={<Info className="w-3.5 h-3.5" />}>
            About Scolify
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Scolify Was Built
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Scolify was created to eliminate opportunity friction for students worldwide by combining source provenance verification, rule-based eligibility checks, and human application control.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card isHoverable className="p-6 space-y-3 border-t-4 border-t-brand-500">
            <Database className="w-8 h-8 text-brand-600" />
            <h3 className="font-extrabold text-slate-900 text-base">Supabase Architecture</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Student profiles, education records, and document vault metadata are isolated securely in Supabase PostgreSQL using Row Level Security (RLS) policies.
            </p>
          </Card>

          <Card isHoverable className="p-6 space-y-3 border-t-4 border-t-indigo-500">
            <Cpu className="w-8 h-8 text-indigo-600" />
            <h3 className="font-extrabold text-slate-900 text-base">Groq AI Infrastructure</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Server-side AI orchestrator generates structured explanations and drafting support via Groq. Groq is called strictly backend-to-backend.
            </p>
          </Card>

          <Card isHoverable className="p-6 space-y-3 border-t-4 border-t-emerald-500">
            <UserCheck className="w-8 h-8 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-base">Human Approval Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Consequential application submissions require your explicit manual review and approval. AI will never silently submit applications on your behalf.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};
