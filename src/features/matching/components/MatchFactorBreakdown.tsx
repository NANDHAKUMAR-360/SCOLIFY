import React from 'react';
import { FactorScores } from '../types/matching';
import { Code2, GraduationCap, Compass, Heart, MapPin, Calendar, Briefcase } from 'lucide-react';

export interface MatchFactorBreakdownProps {
  factorScores: FactorScores;
}

interface FactorMeta {
  key: keyof FactorScores;
  name: string;
  maxWeight: number;
  icon: React.ComponentType<{ className?: string }>;
}

const FACTORS: FactorMeta[] = [
  { key: 'skillMatch', name: 'Skill Match', maxWeight: 30, icon: Code2 },
  { key: 'educationMatch', name: 'Education & GPA', maxWeight: 20, icon: GraduationCap },
  { key: 'interestMatch', name: 'Domain Interests', maxWeight: 15, icon: Compass },
  { key: 'preferenceMatch', name: 'Category Preference', maxWeight: 10, icon: Heart },
  { key: 'locationRemote', name: 'Location / Work Mode', maxWeight: 10, icon: MapPin },
  { key: 'deadlineFeasibility', name: 'Deadline Feasibility', maxWeight: 10, icon: Calendar },
  { key: 'experienceMatch', name: 'Experience / Projects', maxWeight: 5, icon: Briefcase },
];

export const MatchFactorBreakdown: React.FC<MatchFactorBreakdownProps> = ({ factorScores }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Compatibility Factor Breakdown
        </h4>
        <span className="text-[10px] text-slate-400 font-medium">Deterministic Weights (100% max)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {FACTORS.map((factor) => {
          const score = factorScores[factor.key] ?? 0;
          const percentage = Math.min(100, Math.round((score / factor.maxWeight) * 100));
          const Icon = factor.icon;

          return (
            <div
              key={factor.key}
              className="p-3 bg-slate-50/80 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-white border border-slate-200/80 rounded-lg text-slate-600">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-bold text-slate-800">{factor.name}</span>
                </div>
                <span className="font-extrabold text-slate-900 text-xs">
                  {score} / {factor.maxWeight} pts
                </span>
              </div>

              <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentage >= 80
                      ? 'bg-emerald-500'
                      : percentage >= 50
                      ? 'bg-brand-500'
                      : percentage > 0
                      ? 'bg-amber-500'
                      : 'bg-slate-300'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
