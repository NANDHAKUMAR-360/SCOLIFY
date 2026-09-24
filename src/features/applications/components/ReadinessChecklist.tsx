import React from 'react';
import { CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import { ReadinessChecklistItem } from '../../documents/types/readiness';
import { Link } from 'react-router-dom';


interface ReadinessChecklistProps {
  checklist: ReadinessChecklistItem[];
}

export const ReadinessChecklist: React.FC<ReadinessChecklistProps> = ({ checklist }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-sm font-extrabold text-slate-900">Application Readiness Audit</h4>
        <span className="text-[11px] text-slate-500 font-medium">5-Gate Verification Engine</span>
      </div>

      <div className="space-y-3">
        {checklist.map((item) => (
          <div
            key={item.key}
            className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs transition-colors ${
              item.isReady
                ? 'bg-emerald-50/30 border-emerald-200/60'
                : 'bg-rose-50/30 border-rose-200/60'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 shrink-0">
                {item.isReady ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900">{item.label}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                      item.isReady
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.statusText}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{item.details}</p>
              </div>
            </div>

            {item.actionUrl && !item.isReady && (
              <Link
                to={item.actionUrl}
                className="text-[11px] font-bold text-brand-600 hover:text-brand-800 inline-flex items-center gap-0.5 shrink-0 hover:underline"
              >
                Resolve <ArrowUpRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
