import React from 'react';
import { ShieldCheck, ShieldAlert, Shield, AlertTriangle } from 'lucide-react';
import { VerificationStatus } from '../../types/opportunity';
import { cn } from '../../utils/cn';

export interface VerificationBadgeProps {
  status: VerificationStatus;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ status, className }) => {
  const configs: Record<VerificationStatus, { label: string; bg: string; icon: React.ReactNode }> = {
    verified: {
      label: 'Verified Source',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    partially_verified: {
      label: 'Partially Verified',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <Shield className="w-3.5 h-3.5" />,
    },
    warning: {
      label: 'Verification Warning',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    needs_review: {
      label: 'Needs Review',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
    },
    unverified: {
      label: 'Unverified',
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: <Shield className="w-3.5 h-3.5" />,
    },
  };

  const config = configs[status] || configs.unverified;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-2xs',
        config.bg,
        className
      )}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
