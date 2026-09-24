import React from 'react';
import { Skeleton } from './Skeleton';

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading intelligence platform data...' }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-12 text-center space-y-4">
      <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
      <div className="w-full max-w-md space-y-3 mt-4">
        <Skeleton className="h-6 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>
    </div>
  );
};
