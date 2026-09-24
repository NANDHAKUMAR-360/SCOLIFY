import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
    <div className="space-y-4">
      <h1 className="text-6xl font-extrabold text-brand-600">404</h1>
      <h2 className="text-2xl font-bold text-slate-800">Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-sm">The opportunity route you requested does not exist or has been moved.</p>
      <Link to="/dashboard">
        <Button variant="primary">Return to Dashboard</Button>
      </Link>
    </div>
  </div>
);
