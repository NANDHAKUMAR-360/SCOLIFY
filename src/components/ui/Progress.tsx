import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressProps {
  value: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorClass?: string;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  label,
  showPercentage = true,
  size = 'md',
  colorClass = 'bg-gradient-to-r from-brand-500 to-emerald-500',
  className,
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
          {label && <span>{label}</span>}
          {showPercentage && <span className="text-slate-500">{clamped}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden', heightStyles[size])}>
        <div
          className={cn('h-full transition-all duration-500 rounded-full', colorClass)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
