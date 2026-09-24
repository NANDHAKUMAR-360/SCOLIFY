import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export interface SkillGapListProps {
  matchedSkills: string[];
  missingSkills: string[];
}

export const SkillGapList: React.FC<SkillGapListProps> = ({ matchedSkills, missingSkills }) => {
  const hasSkills = matchedSkills.length > 0 || missingSkills.length > 0;

  if (!hasSkills) {
    return null;
  }

  return (
    <div className="space-y-3 pt-1">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
        Skill Alignment & Gaps
      </h4>

      <div className="space-y-2.5">
        {/* Matched Skills */}
        {matchedSkills.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Matched Skills ({matchedSkills.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {matchedSkills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold capitalize"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {missingSkills.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-amber-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Missing Skills / Recommended ({missingSkills.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold capitalize"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
