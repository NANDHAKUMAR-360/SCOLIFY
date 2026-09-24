import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  Compass,
  FolderKanban,
  FileCheck2,
  Award,
  Bookmark,
  Sparkles,
  Settings,
  User,
  Clock
} from 'lucide-react';
import { cn } from '../utils/cn';
import { ScolifyLogo } from '../components/common/ScolifyLogo';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Scholarships', path: '/scholarships', icon: <GraduationCap className="w-4 h-4" />, badge: 'Primary' },
  { label: 'Internships', path: '/internships', icon: <Briefcase className="w-4 h-4" />, badge: 'Verified' },
  { label: 'All Opportunities', path: '/opportunities', icon: <Compass className="w-4 h-4" /> },
  { label: 'My Applications', path: '/applications', icon: <FolderKanban className="w-4 h-4" /> },
  { label: 'Document Vault', path: '/documents', icon: <FileCheck2 className="w-4 h-4" /> },
  { label: 'Certifications', path: '/certifications', icon: <Award className="w-4 h-4" /> },
  { label: 'Saved', path: '/saved', icon: <Bookmark className="w-4 h-4" /> },
  { label: 'Reminders', path: '/reminders', icon: <Clock className="w-4 h-4" /> },
  { label: 'AI Assistant', path: '/ai-assistant', icon: <Sparkles className="w-4 h-4 text-violet-500" /> },
  { label: 'Student Profile', path: '/profile', icon: <User className="w-4 h-4" /> },
  { label: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between py-6 px-4 shrink-0 hidden md:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div className="px-3 pb-2 border-b border-slate-100">
          <ScolifyLogo variant="transparent" size="sm" contextBg="sidebar" showTagline={false} />
        </div>
        <div>
          <p className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
            Opportunity Engine
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group',
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* AI Trust & Approval Status Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-slate-50 to-brand-50 border border-brand-100 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Human Approval Engine</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          AI suggests matches & drafts. Final application submission always remains in your hands.
        </p>
      </div>
    </aside>
  );
};
