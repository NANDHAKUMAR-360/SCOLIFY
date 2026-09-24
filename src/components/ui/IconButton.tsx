import React from 'react';
import { cn } from '../../utils/cn';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  className,
  variant = 'ghost',
  size = 'md',
  ariaLabel,
  children,
  ...props
}) => {
  const sizeStyles = {
    sm: 'p-1.5 text-sm rounded-lg',
    md: 'p-2.5 text-base rounded-xl',
    lg: 'p-3 text-lg rounded-2xl',
  };

  const variantStyles = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
  };

  return (
    <button
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer active:scale-95',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
