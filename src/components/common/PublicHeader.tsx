import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Search,
  ArrowRight,
  Menu,
  X,
  GraduationCap,
  Briefcase,
  Compass,
  Info,
  Home,
  WifiOff
} from 'lucide-react';
import { Button } from '../ui/Button';
import { ScolifyLogo } from './ScolifyLogo';
import { useAuthStore } from '../../store/authStore';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface PublicHeaderProps {
  onSearchClick?: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ onSearchClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { isOnline } = useNetworkStatus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = location.pathname === '/' || location.pathname === '/about';

  const handleNavClick = (sectionId: string, route: string) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const elem = document.getElementById(sectionId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate(route);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="shrink-0 flex items-center gap-2">
          <ScolifyLogo variant="transparent" size="sm" contextBg="header" showTagline={false} />
        </div>

        {/* Primary Desktop Navigation Bar (Matching Reference Visual Style) */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-50/80 border border-slate-200/60 rounded-full text-xs font-semibold text-slate-600 shadow-2xs">
          {/* Active Home Pill */}
          <button
            onClick={() => handleNavClick('hero', '/')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold transition-all ${
              isHome
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'hover:bg-slate-200/60 text-slate-700'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => handleNavClick('opportunities', '/opportunities')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:bg-slate-200/60 text-slate-700 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span>Opportunities</span>
          </button>

          <button
            onClick={() => handleNavClick('internships', '/internships')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:bg-slate-200/60 text-slate-700 transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>Internships</span>
          </button>

          <button
            onClick={() => handleNavClick('scholarships', '/scholarships')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:bg-slate-200/60 text-slate-700 transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            <span>Scholarships</span>
          </button>

          {/* Standalone AI Assistant Route */}
          <Link
            to="/ai-assistant"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:bg-slate-200/60 text-slate-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span>AI Assistant</span>
          </Link>

          <button
            onClick={() => handleNavClick('about', '/about')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:bg-slate-200/60 text-slate-700 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>About</span>
          </button>
        </nav>

        {/* Right Side Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Connectivity Status Indicator */}
          <div
            className={`hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
            title={isOnline ? 'Connected to Scolify Live Verification Engine' : 'Offline — showing saved information'}
          >
            {isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-600" />
                <span>Offline (Saved Data)</span>
              </>
            )}
          </div>

          <button
            onClick={onSearchClick}
            className="p-2.5 rounded-full bg-slate-50 border border-slate-200/70 text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Search opportunities"
          >
            <Search className="w-4 h-4" />
          </button>

          {isAuthenticated ? (
            <Button
              variant="gradient"
              size="sm"
              onClick={() => navigate('/dashboard')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="font-bold shadow-md shadow-brand-500/20"
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-block">
                <Button variant="ghost" size="sm" className="font-semibold text-slate-700">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="gradient"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="font-bold shadow-md shadow-brand-500/20"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 mt-3 pt-4 pb-6 space-y-3 bg-white animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-1 text-sm font-semibold text-slate-700">
            <button
              onClick={() => handleNavClick('hero', '/')}
              className="px-4 py-2.5 rounded-xl hover:bg-slate-50 text-left font-bold text-brand-600"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('opportunities', '/opportunities')}
              className="px-4 py-2.5 rounded-xl hover:bg-slate-50 text-left"
            >
              Opportunities
            </button>
            <button
              onClick={() => handleNavClick('internships', '/internships')}
              className="px-4 py-2.5 rounded-xl hover:bg-slate-50 text-left"
            >
              Internships
            </button>
            <button
              onClick={() => handleNavClick('scholarships', '/scholarships')}
              className="px-4 py-2.5 rounded-xl hover:bg-slate-50 text-left"
            >
              Scholarships
            </button>
            <Link
              to="/ai-assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl hover:bg-slate-50 text-left flex items-center gap-2 text-violet-600 font-bold"
            >
              <Sparkles className="w-4 h-4" /> AI Assistant
            </Link>
            <button
              onClick={() => handleNavClick('about', '/about')}
              className="px-4 py-2.5 rounded-xl hover:bg-slate-50 text-left"
            >
              About
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
