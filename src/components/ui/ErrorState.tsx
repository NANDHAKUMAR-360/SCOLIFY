import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading your opportunity intelligence data.',
  onRetry,
}) => {
  return (
    <div className="w-full bg-rose-50/50 border border-rose-200/60 rounded-3xl p-8 text-center flex flex-col items-center justify-center space-y-4">
      <div className="p-3.5 bg-rose-100 rounded-2xl text-rose-600">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-600 max-w-md">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="border-rose-200 text-rose-700 hover:bg-rose-100/50">
          Try Again
        </Button>
      )}
    </div>
  );
};
