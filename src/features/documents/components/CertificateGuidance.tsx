import React from 'react';
import { Award, ExternalLink } from 'lucide-react';
import { CertificateGuidanceResult } from '../types/documents';
import { DocumentStatusBadge } from './DocumentStatusBadge';


interface CertificateGuidanceProps {
  guidance: CertificateGuidanceResult | null;
  isLoading?: boolean;
}

export const CertificateGuidance: React.FC<CertificateGuidanceProps> = ({ guidance, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="p-5 bg-white border border-slate-100 rounded-2xl animate-pulse space-y-3">
        <div className="h-5 w-44 bg-slate-200 rounded-md" />
        <div className="h-16 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (!guidance || guidance.guidanceItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
          <Award className="w-4 h-4" />
        </span>
        <div>
          <h4 className="text-sm font-extrabold text-slate-900">Certificate & Document Guidance</h4>
          <p className="text-[11px] text-slate-500">
            Actionable instructions and official validation steps for required certificates.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {guidance.guidanceItems.map((item, idx) => (
          <div
            key={idx}
            className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl space-y-2 text-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h5 className="font-extrabold text-slate-900">{item.title}</h5>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  <span className="font-bold text-slate-700">Why required: </span>
                  {item.whyRequired}
                </p>
              </div>
              <DocumentStatusBadge status={item.status} />
            </div>

            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 pt-1 border-t border-slate-200/50">
              <span>Required: {item.isRequired ? 'Mandatory' : 'Optional / Preferred'}</span>
              <span>•</span>
              <span>Student Has It: {item.studentHasIt ? 'Yes' : 'No'}</span>
              {item.expiryDate && (
                <>
                  <span>•</span>
                  <span className="text-amber-700">Expiry: {item.expiryDate}</span>
                </>
              )}
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 text-[11px] text-slate-700 space-y-1">
              <span className="font-bold text-slate-800">What to do next:</span>
              <p className="leading-relaxed">{item.whatToDoNext}</p>
            </div>

            {item.officialPortalUrl && (
              <div className="pt-1 flex items-center justify-end">
                <a
                  href={item.officialPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-brand-600 hover:text-brand-800 font-bold inline-flex items-center gap-1 hover:underline"
                >
                  <span>Official Application Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
