import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { ApplicationReadinessResult } from '../types/readiness';
import { Button } from '../../../components/ui/Button';


interface ApplicationReadinessProps {
  readiness: ApplicationReadinessResult | null;
  isLoading?: boolean;
  onPrepareClick?: () => void;
}

export const ApplicationReadiness: React.FC<ApplicationReadinessProps> = ({
  readiness,
  isLoading = false,
  onPrepareClick,
}) => {
  if (isLoading) {
    return (
      <div className="p-6 bg-white border border-slate-100 rounded-3xl animate-pulse space-y-4">
        <div className="h-6 w-48 bg-slate-200 rounded-lg" />
        <div className="h-20 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (!readiness) return null;

  const isReady = readiness.overallReady;
  const isBlocked = readiness.overallStatus === 'BLOCKED';
  const isExpired = readiness.overallStatus === 'EXPIRED';

  return (
    <div className="bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/90 rounded-3xl p-6 space-y-5 shadow-xs">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl ${
              isReady
                ? 'bg-emerald-50 text-emerald-600'
                : isBlocked
                ? 'bg-rose-50 text-rose-600'
                : isExpired
                ? 'bg-slate-100 text-slate-500'
                : 'bg-amber-50 text-amber-600'
            }`}
          >
            {isReady ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : isBlocked ? (
              <ShieldAlert className="w-6 h-6" />
            ) : isExpired ? (
              <Clock className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">Application Readiness</h3>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isReady
                    ? 'bg-emerald-100 text-emerald-800'
                    : isBlocked
                    ? 'bg-rose-100 text-rose-800'
                    : isExpired
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {readiness.overallStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic verification across academic, eligibility, and document requirements.
            </p>
          </div>
        </div>

        {onPrepareClick && !isBlocked && !isExpired && (
          <Button
            variant="gradient"
            size="md"
            onClick={onPrepareClick}
            leftIcon={<Sparkles className="w-4 h-4" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="font-bold shrink-0 shadow-md shadow-brand-500/20"
          >
            Prepare Application
          </Button>
        )}
      </div>

      {/* 5-Dimension Checklist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {readiness.checklist.map((item) => (
          <div
            key={item.key}
            className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-2 text-xs transition-all ${
              item.isReady
                ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950'
                : 'bg-rose-50/40 border-rose-200/70 text-rose-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500">
                {item.label}
              </span>
              {item.isReady ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
            </div>

            <div className="space-y-0.5">
              <p className="font-bold text-xs">{item.statusText}</p>
              <p className="text-[10px] text-slate-600 leading-tight line-clamp-2">{item.details}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Blockers & Action Items */}
      {readiness.blockers.length > 0 && (
        <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Application Blockers</span>
          </div>
          <ul className="space-y-1 text-xs text-rose-800 list-disc list-inside">
            {readiness.blockers.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {readiness.warnings.length > 0 && (
        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Advisory Warnings</span>
          </div>
          <ul className="space-y-1 text-xs text-amber-800 list-disc list-inside">
            {readiness.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
