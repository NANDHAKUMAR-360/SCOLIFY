import React from 'react';
import { MatchExplanationData } from '../types/matching';
import { Sparkles, ShieldCheck, ArrowRightCircle, Info } from 'lucide-react';

export interface MatchExplanationProps {
  explanation?: MatchExplanationData;
  aiExplanation?: string | null;
  strengths?: string[];
  gaps?: string[];
}

export const MatchExplanation: React.FC<MatchExplanationProps> = ({
  explanation,
  aiExplanation,
  strengths = [],
  gaps = [],
}) => {
  const summary = explanation?.summary;
  const nextSteps = explanation?.nextSteps;

  return (
    <div className="space-y-4 pt-1">
      {/* Deterministic Explanation */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Deterministic Match Analysis
          </h4>
        </div>

        {summary && (
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {summary}
          </p>
        )}

        {/* Strengths & Gaps Lists */}
        {strengths.length > 0 && (
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-emerald-800">Key Strengths:</p>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
              {strengths.map((str, i) => (
                <li key={i}>{str}</li>
              ))}
            </ul>
          </div>
        )}

        {gaps.length > 0 && (
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-amber-800">Areas for Improvement / Gaps:</p>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
              {gaps.map((gap, i) => (
                <li key={i}>{gap}</li>
              ))}
            </ul>
          </div>
        )}

        {nextSteps && (
          <div className="pt-1 flex items-start gap-2 text-xs text-brand-800 font-semibold bg-brand-50/70 p-2.5 rounded-xl border border-brand-100">
            <ArrowRightCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <span>Next Steps: {nextSteps}</span>
          </div>
        )}
      </div>

      {/* AI Explanation Section */}
      <div className="p-4 bg-gradient-to-br from-violet-50/70 via-indigo-50/40 to-slate-50 border border-indigo-100 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-indigo-600 text-white rounded-md">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              AI Summary & Insights
            </h4>
          </div>
          <span className="text-[10px] font-semibold text-indigo-600 px-2 py-0.5 bg-indigo-100/60 rounded-full">
            Explanation Layer Only
          </span>
        </div>

        {aiExplanation ? (
          <p className="text-xs text-indigo-950 leading-relaxed font-medium">
            {aiExplanation}
          </p>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-1 font-medium">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>AI explanation is currently unavailable. Deterministic rule evaluation remains authoritative.</span>
          </div>
        )}
      </div>
    </div>
  );
};
