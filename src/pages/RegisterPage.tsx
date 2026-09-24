import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { PasswordStrengthMeter, calculatePasswordScore } from '../components/ui/PasswordStrengthMeter';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { authStore } from '../store/authStore';
import { ScolifyLogo } from '../components/common/ScolifyLogo';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { score } = calculatePasswordScore(password);
  const isPasswordMatch = password && confirmPassword && password === confirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordMatch) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (score < 2) {
      setErrorMsg('Please create a stronger password (minimum 8 characters with numbers or special characters).');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await authService.register(email, password, fullName);
      try {
        const canonical = await profileService.initProfile();
        authStore.setCanonicalProfile(canonical);
      } catch {}
      navigate('/onboarding');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create student account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-card-hover space-y-6">
        <div className="text-center space-y-2 flex flex-col items-center">
          <ScolifyLogo variant="transparent" size="md" contextBg="light" showTagline={true} className="mb-1" />
          <h1 className="text-2xl font-extrabold text-slate-900">Create Student Account</h1>
          <p className="text-xs text-slate-500">Discover verified scholarships & internships matched to you</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Nandhakumar"
            leftIcon={<User className="w-4 h-4" />}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="University / Institutional Email"
            type="email"
            placeholder="student@university.edu"
            leftIcon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create password"
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
            <PasswordStrengthMeter password={password} />
          </div>

          <div>
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
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
            disabled={!fullName || !email || !password || !isPasswordMatch || score < 2}
            className="w-full font-bold py-3 mt-2"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Account & Start Onboarding
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have a student account?{' '}
          <Link to="/login" className="text-brand-600 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
