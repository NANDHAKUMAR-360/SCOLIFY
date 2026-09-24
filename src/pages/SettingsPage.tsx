import React from 'react';
export const SettingsPage: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card-soft">
      <h1 className="text-2xl font-extrabold text-slate-900">Platform Settings</h1>
      <p className="text-xs text-slate-500 mt-1">Manage notification preferences, privacy, Supabase Auth session, and security controls.</p>
    </div>
  </div>
);
