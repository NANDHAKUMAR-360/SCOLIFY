import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { ScolifyLogo } from '../components/common/ScolifyLogo';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setIsSent(true);
    } catch (err: any) {
      // Show graceful confirmation state regardless to prevent account enumeration
      setIsSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-card-hover space-y-6">
        <div className="text-center space-y-2 flex flex-col items-center">
          <ScolifyLogo variant="transparent" size="md" contextBg="light" showTagline={true} className="mb-1" />
          <h1 className="text-2xl font-extrabold text-slate-900">Reset Password</h1>
          <p className="text-xs text-slate-500">Enter your university email to receive a password recovery link</p>
        </div>

        {isSent ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">Recovery Email Sent</h3>
            <p className="text-xs text-slate-600">
              If an account exists for <span className="font-bold text-slate-800">{email}</span>, you will receive password reset instructions shortly.
            </p>
            <Link to="/login">
              <Button variant="outline" size="sm" className="w-full mt-2 bg-white">
                Return to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {errorMsg}
              </div>
            )}
            <Input
              label="Email Address"
              type="email"
              placeholder="student@university.edu"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full font-bold py-3">
              Send Password Reset Link
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-semibold hover:text-brand-600">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
