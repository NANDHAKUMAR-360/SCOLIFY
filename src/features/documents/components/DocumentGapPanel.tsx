import React from 'react';
import { FileText, AlertTriangle, ArrowRight } from 'lucide-react';
import { DocumentGapAnalysis } from '../types/documents';
import { DocumentStatusBadge } from './DocumentStatusBadge';

import { useNavigate } from 'react-router-dom';

interface DocumentGapPanelProps {
  gapAnalysis: DocumentGapAnalysis | null;
  isLoading?: boolean;
}

export const DocumentGapPanel: React.FC<DocumentGapPanelProps> = ({ gapAnalysis, isLoading = false }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="p-5 bg-white border border-slate-100 rounded-2xl animate-pulse space-y-3">
        <div className="h-5 w-48 bg-slate-200 rounded-md" />
        <div className="h-16 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (!gapAnalysis) return null;

  const totalReqs = gapAnalysis.requiredDocuments.length;
  const availableCount = gapAnalysis.availableDocuments.length;
  const isComplete = gapAnalysis.readinessStatus === 'READY';

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-brand-50 text-brand-600 rounded-lg">
            <FileText className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">Document Intelligence & Gap Analysis</h4>
            <p className="text-[11px] text-slate-500">
              Deterministic verification of your uploaded documents against requirements.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
              isComplete
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {isComplete ? 'All Documents Ready' : `${availableCount}/${totalReqs} Available`}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-semibold text-slate-500">
          <span>Verification Readiness</span>
          <span>{gapAnalysis.completionPercentage}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              gapAnalysis.completionPercentage === 100 ? 'bg-emerald-500' : 'bg-brand-500'
            }`}
            style={{ width: `${gapAnalysis.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Warnings */}
      {gapAnalysis.warnings.length > 0 && (
        <div className="space-y-1.5">
          {gapAnalysis.warnings.map((warn, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900 font-medium"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}

      {/* Requirement List */}
      {totalReqs === 0 ? (
        <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
          This opportunity does not specify mandatory documents.
        </p>
      ) : (
        <div className="space-y-2">
          {gapAnalysis.requiredDocuments.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                item.status === 'available'
                  ? 'bg-emerald-50/30 border-emerald-200/60'
                  : item.status === 'expired'
                  ? 'bg-amber-50/40 border-amber-200/70'
                  : 'bg-rose-50/30 border-rose-200/60'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{item.title}</span>
                  {item.isMandatory && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                      Mandatory
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">{item.actionRequired}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <DocumentStatusBadge status={item.status} />
                {item.status !== 'available' && (
                  <button
                    onClick={() => navigate('/documents')}
                    className="p-1 text-brand-600 hover:text-brand-800 font-bold text-[11px] flex items-center gap-0.5 hover:underline"
                  >
                    Upload <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
