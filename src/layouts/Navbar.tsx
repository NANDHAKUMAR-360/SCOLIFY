import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Bell, Search, User, Settings, HelpCircle, LogOut, ChevronDown } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { IconButton } from '../components/ui/IconButton';
import { authStore, useAuthStore } from '../store/authStore';
import { ScolifyLogo } from '../components/common/ScolifyLogo';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/opportunities?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await authStore.logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.fullName || 'Student User';
  const displayEmail = user?.email || 'student@scolify.org';

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 lg:px-8 py-2.5 transition-all">
      <div className="w-full flex items-center justify-between gap-4">
        {/* Official Scolify Brand Navigation */}
        <div className="shrink-0">
          <ScolifyLogo variant="transparent" size="sm" contextBg="header" showTagline={false} />
        </div>

        {/* Global Quick Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search verified scholarships, tech internships, grants..."
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>
        </form>

        {/* Action Controls & User Account Dropdown Menu */}
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/notifications">
            <IconButton ariaLabel="Notifications" variant="ghost" className="relative text-slate-600">
              <Bell className="w-5 h-5" />
            </IconButton>
          </Link>

          <Link to="/ai-assistant">
            <button className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-50 via-indigo-50 to-cyan-50 border border-brand-200/60 text-brand-700 text-xs font-bold hover:shadow-sm transition-all">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              AI Assistant
            </button>
          </Link>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* User Profile Area & Account Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-slate-50 transition-colors focus:outline-none"
            >
              <Avatar name={displayName} src={user?.avatarUrl} size="sm" />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 line-clamp-1">{displayName}</p>
                <p className="text-[11px] font-medium text-emerald-600">Verified Student</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-card-hover py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{displayEmail}</p>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 font-semibold hover:bg-slate-50 hover:text-brand-600 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 font-semibold hover:bg-slate-50 hover:text-brand-600 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings</span>
                  </Link>

                  <Link
                    to="/support"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 font-semibold hover:bg-slate-50 hover:text-brand-600 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    <span>Help & Support</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 font-bold hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
