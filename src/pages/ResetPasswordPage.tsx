import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { PasswordStrengthMeter, calculatePasswordScore } from '../components/ui/PasswordStrengthMeter';
import { supabase } from '../lib/supabase';
import { ScolifyLogo } from '../components/common/ScolifyLogo';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { score } = calculatePasswordScore(newPassword);
  const isPasswordMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordMatch) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (score < 2) {
      setErrorMsg('Please enter a stronger password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password. Password reset link may be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-card-hover space-y-6">
        <div className="text-center space-y-2 flex flex-col items-center">
          <ScolifyLogo variant="transparent" size="md" contextBg="light" showTagline={true} className="mb-1" />
          <h1 className="text-2xl font-extrabold text-slate-900">Set New Password</h1>
          <p className="text-xs text-slate-500">Create a secure new password for your Scolify student account</p>
        </div>

        {isSuccess ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">Password Reset Successful</h3>
            <p className="text-xs text-slate-600">Your account password has been updated. You can now log in with your new credentials.</p>
            <Button variant="primary" size="sm" onClick={() => navigate('/login')} className="w-full mt-2">
              Proceed to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {errorMsg}
              </div>
            )}

            <div>
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
                leftIcon={<Lock className="w-4 h-4" />}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <PasswordStrengthMeter password={newPassword} />
            </div>

            <div>
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter new password"
                leftIcon={<Lock className="w-4 h-4" />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && !isPasswordMatch && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              variant="gradient"
              isLoading={isLoading}
              disabled={!newPassword || !isPasswordMatch || score < 2}
              className="w-full font-bold py-3 mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
