import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'bordered' | 'gradient';
  isHoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  isHoverable = true,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border border-slate-100 shadow-card-soft',
    elevated: 'bg-white shadow-card-hover border border-slate-100',
    bordered: 'bg-white border border-slate-200 shadow-none',
    gradient: 'bg-gradient-to-br from-white via-slate-50 to-brand-50/30 border border-brand-100/50 shadow-card-soft',
  };

  return (
    <motion.div
      whileHover={isHoverable ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'rounded-2xl p-5 md:p-6 transition-all duration-200 overflow-hidden',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
