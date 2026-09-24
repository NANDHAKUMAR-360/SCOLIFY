import React from 'react';
import { CheckCircle2, AlertCircle, Clock, AlertTriangle } from 'lucide-react';
import { DocumentGapStatus } from '../types/documents';

interface DocumentStatusBadgeProps {
  status: DocumentGapStatus | string;
  className?: string;
}

export const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'available':
    case 'verified':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Available & Verified
        </span>
      );

    case 'missing':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          Missing Document
        </span>
      );

    case 'expired':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Expired Document
        </span>
      );

    case 'pending_verification':
    case 'unverified':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          Pending Verification
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
        >
          {status}
        </span>
      );
  }
};
