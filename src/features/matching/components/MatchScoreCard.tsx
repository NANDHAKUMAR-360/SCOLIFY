import React from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export interface MatchScoreCardProps {
  score: number | null;
  scoreVersion: string;
  isStale?: boolean;
  generatedAt?: string;
  onRecalculate?: () => void;
  isRecalculating?: boolean;
}

export function getScoreBand(score: number | null): { label: string; color: string; bg: string; text: string } {
  const val = score ?? 0;
  if (val >= 85) {
    return { label: 'Strong Alignment', color: 'emerald', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' };
  }
  if (val >= 70) {
    return { label: 'High Alignment', color: 'blue', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' };
  }
  if (val >= 50) {
    return { label: 'Moderate Alignment', color: 'amber', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' };
  }
  if (val >= 25) {
    return { label: 'Developing Alignment', color: 'orange', bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700' };
  }
  return { label: 'Low Alignment', color: 'rose', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' };
}

export const MatchScoreCard: React.FC<MatchScoreCardProps> = ({
  score,
  scoreVersion,
  isStale,
  generatedAt,
  onRecalculate,
  isRecalculating = false,
}) => {
  const band = getScoreBand(score);
  const displayScore = score !== null ? `${Math.round(score)}%` : 'N/A';

  return (
    <div className={`p-5 rounded-3xl border ${band.bg} transition-all space-y-4`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" />
              Deterministic Match Score
            </span>
            <span className="text-[10px] font-mono text-slate-500">v{scoreVersion}</span>
            {isStale && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Stale
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Evaluated deterministically across academic profile, skills, and sponsor criteria.
          </p>
        </div>

        {onRecalculate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRecalculate}
            isLoading={isRecalculating}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />}
            className="self-start sm:self-auto bg-white/80"
          >
            Re-evaluate
          </Button>
        )}
      </div>

      <div className="flex items-baseline gap-4 pt-1">
        <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          {displayScore}
        </div>
        <div className="space-y-0.5">
          <div className={`text-base font-extrabold ${band.text}`}>
            {band.label}
          </div>
          {generatedAt && (
            <div className="text-[10px] text-slate-400">
              Calculated on {new Date(generatedAt).toLocaleDateString()} at{' '}
              {new Date(generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
