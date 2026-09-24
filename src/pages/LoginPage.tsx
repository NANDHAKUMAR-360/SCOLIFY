import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { authStore } from '../store/authStore';
import { ScolifyLogo } from '../components/common/ScolifyLogo';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      await authService.login(email, password);
      const canonical = await profileService.getProfile();
      authStore.setCanonicalProfile(canonical);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email address or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-card-hover space-y-6">
        <div className="text-center space-y-2 flex flex-col items-center">
          <ScolifyLogo variant="transparent" size="md" contextBg="light" showTagline={true} className="mb-1" />
          <h1 className="text-2xl font-extrabold text-slate-900">Sign in to Scolify</h1>
          <p className="text-xs text-slate-500">Access your verified opportunity intelligence dashboard</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="student@university.edu"
            leftIcon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>Remember this device</span>
            </label>
            <Link to="/forgot-password" className="text-brand-600 font-semibold hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="gradient"
            isLoading={isLoading}
            className="w-full font-bold py-3 mt-2"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to Dashboard
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have a student account yet?{' '}
          <Link to="/register" className="text-brand-600 font-bold hover:underline">
            Register as Student
          </Link>
        </div>
      </div>
    </div>
  );
};
