import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password?: string;
}

export interface PasswordChecks {
  length: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export const calculatePasswordScore = (pwd: string = ''): {
  score: number;
  label: string;
  color: string;
  checks: PasswordChecks;
} => {
  const checks: PasswordChecks = {
    length: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[^A-Za-z0-9]/.test(pwd),
  };

  if (!pwd) return { score: 0, label: 'Empty', color: 'bg-slate-200', checks };

  let score = 0;
  if (checks.length) score += 1;
  if (checks.hasUpper && checks.hasLower) score += 1;
  if (checks.hasNumber) score += 1;
  if (checks.hasSpecial) score += 1;

  let label = 'Weak';
  let color = 'bg-rose-500';
  if (score === 2) {
    label = 'Fair';
    color = 'bg-amber-500';
  } else if (score === 3) {
    label = 'Good';
    color = 'bg-indigo-500';
  } else if (score >= 4) {
    label = 'Strong';
    color = 'bg-emerald-500';
  }

  return { score, label, color, checks };
};

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password = '' }) => {
  if (!password) return null;

  const { score, label, color, checks } = calculatePasswordScore(password);

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
        <span>Password Strength:</span>
        <span className="font-extrabold text-slate-800">{label}</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step <= score ? color : 'bg-slate-100'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-slate-500 pt-1">
        <div className="flex items-center gap-1">
          {checks.length ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-300" />}
          <span>Min 8 characters</span>
        </div>
        <div className="flex items-center gap-1">
          {checks.hasUpper && checks.hasLower ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-300" />}
          <span>Upper & lowercase</span>
        </div>
        <div className="flex items-center gap-1">
          {checks.hasNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-300" />}
          <span>Numeric digit</span>
        </div>
        <div className="flex items-center gap-1">
          {checks.hasSpecial ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-300" />}
          <span>Special character</span>
        </div>
      </div>
    </div>
  );
};
