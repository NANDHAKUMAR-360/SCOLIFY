import React from 'react';
import { SearchX } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon = <SearchX className="w-10 h-10 text-brand-500" />,
}) => {
  return (
    <div className="w-full bg-white border border-slate-100 rounded-3xl p-10 text-center flex flex-col items-center justify-center space-y-4 shadow-card-soft">
      <div className="p-4 bg-brand-50 rounded-2xl text-brand-600 mb-2">{icon}</div>
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction} className="mt-2">
          {actionText}
        </Button>
      )}
    </div>
  );
};
