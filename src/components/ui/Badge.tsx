import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'emerald' | 'amber' | 'violet' | 'rose' | 'slate' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  size = 'md',
  icon,
  className,
}) => {
  const variantStyles = {
    brand: 'bg-brand-50 text-brand-700 border-brand-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    outline: 'bg-transparent text-slate-700 border-slate-300',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-semibold rounded-md gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold rounded-lg gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center border font-medium tracking-wide shadow-2xs',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
};
