import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { publicExperienceContent } from '../../config/publicExperience';

export const OpportunitiesSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="opportunities" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
      {/* Chapter Title */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <Badge variant="brand" icon={<Compass className="w-3.5 h-3.5" />}>
          Explore Opportunities
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Opportunities for Every Dream
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          From verified undergraduate scholarships to high-impact tech internships, research fellowships, and global competitions — Scolify brings student opportunity intelligence into one unified experience.
        </p>
      </div>

      {/* Product Lifecycle Grid */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-900">The 8-Stage Scolify Opportunity Journey</h3>
          <p className="text-xs text-slate-500">How Scolify connects your canonical profile to official submission</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {publicExperienceContent.productLifecycle.map((item) => (
            <div
              key={item.step}
              className="p-5 bg-white rounded-3xl border border-slate-100 shadow-card-soft space-y-2 relative"
            >
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-extrabold text-xs">
                  {item.step}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Pipeline Architecture Showcase */}
      <div className="p-8 bg-slate-900 text-white rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <Badge variant="brand" className="bg-brand-500/20 text-brand-300 border-brand-500/30">
              Verification Engine Architecture
            </Badge>
            <h3 className="text-2xl font-extrabold">Multi-Stage Opportunity Trust Pipeline</h3>
          </div>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => navigate('/opportunities')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            View Live Feed
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {publicExperienceContent.verificationStages.slice(0, 4).map((stage, idx) => (
            <div key={idx} className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
              <p className="text-xs font-bold text-brand-400">{stage.name}</p>
              <p className="text-[11px] text-slate-400">{stage.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
