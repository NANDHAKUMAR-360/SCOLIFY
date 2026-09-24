import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { formatDaysRemaining } from '../../utils/formatters';
import { cn } from '../../utils/cn';

export interface DeadlineBadgeProps {
  deadlineIso?: string;
  className?: string;
}

export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({ deadlineIso, className }) => {
  const info = formatDaysRemaining(deadlineIso);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border',
        info.urgent
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : 'bg-slate-50 text-slate-700 border-slate-200',
        className
      )}
    >
      {info.urgent ? <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> : <Clock className="w-3.5 h-3.5 text-slate-500" />}
      <span>{info.text}</span>
    </span>
  );
};
