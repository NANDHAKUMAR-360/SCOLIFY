import React, { useEffect, useState } from 'react';
import { CheckCircle2, GraduationCap, Sparkles, Award, MapPin, Edit3, FileCheck2, Sliders, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { profileService } from '../services/profileService';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, canonicalProfile } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(canonicalProfile);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await profileService.getProfile();
        setProfileData(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    }
    loadProfile();
  }, []);

  const p = profileData?.profile || {};
  const s = profileData?.student || {};
  const education = profileData?.education || [];
  const skills = profileData?.skills || [];
  const interests = profileData?.interests || [];
  const completion = profileData?.completion || {
    percentage: s.completion_percentage || 0,
    completedSections: [],
    incompleteSections: ['Basic Information', 'Education', 'Skills', 'Interests'],
    nextAction: 'Complete onboarding wizard to set up your student profile.',
  };

  const displayName = p.full_name || user?.fullName || 'Student User';
  const headline = s.headline || 'Canonical Student Profile';
  const preferredCategories = s.preferred_categories || ['scholarship', 'internship'];

  return (
    <div className="space-y-6">
      {/* Top Identity Card */}
      <Card variant="gradient" isHoverable={false} className="p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar name={displayName} src={p.avatar_url || user?.avatarUrl} size="xl" />
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900">{displayName}</h1>
              <Badge variant="emerald" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                Verified Student
              </Badge>
            </div>
            <p className="text-sm font-semibold text-slate-700">{headline}</p>
            <p className="text-xs text-slate-500 flex items-center gap-3">
              <span>{p.email || user?.email}</span>
              {s.country && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {s.city ? `${s.city}, ${s.country}` : s.country}
                </span>
              )}
            </p>
          </div>
          <div className="w-full md:w-64 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm space-y-2">
            <Progress value={completion.percentage} label="Canonical Profile Strength" />
            <p className="text-[11px] text-slate-500 leading-tight">{completion.nextAction}</p>
            <Link to="/onboarding">
              <Button variant="outline" size="sm" className="w-full mt-1 bg-white" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                Edit Profile Wizard
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Education Section */}
        <Card isHoverable={false} className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-brand-50 text-brand-600 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-900">Academic Education</h3>
            </div>
            <Badge variant="brand">{education.length} Records</Badge>
          </div>

          {education.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 space-y-2 bg-slate-50/60 rounded-2xl border border-slate-100">
              <p className="font-semibold text-slate-700">No academic education records added yet.</p>
              <p className="text-[11px] text-slate-500">Academic records unlock GPA rule evaluation.</p>
              <Link to="/onboarding">
                <Button variant="outline" size="sm" className="mt-2 bg-white">Add Education Record</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {education.map((edu: any) => (
                <div key={edu.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">{edu.institution_name}</h4>
                  <p className="text-xs font-semibold text-brand-700">{edu.degree} — {edu.field_of_study}</p>
                  {edu.gpa && <p className="text-[11px] text-slate-500 font-medium">GPA: {edu.gpa} / {edu.max_gpa || 4.0}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Skills & Domain Interests Section */}
        <Card isHoverable={false} className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-900">Verified Technical Skills</h3>
            </div>
            {skills.length === 0 ? (
              <p className="text-xs text-slate-500 p-3 bg-slate-50/60 rounded-xl border border-slate-100">No technical skills added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((sk: any) => (
                  <Badge key={sk.id} variant="emerald" className="py-1 px-2.5 text-xs">
                    {sk.skill_name} ({sk.proficiency_level || 'intermediate'})
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="p-2 bg-violet-50 text-violet-600 rounded-xl">
                <Award className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-900">Domain Interests & Focus Tags</h3>
            </div>
            {interests.length === 0 ? (
              <p className="text-xs text-slate-500 p-3 bg-slate-50/60 rounded-xl border border-slate-100">No domain interest tags listed yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {interests.map((int: any) => (
                  <Badge key={int.id} variant="violet" className="py-1 px-2.5 text-xs">
                    #{int.interest_tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Document Readiness Vault Summary */}
        <Card isHoverable={false} className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileCheck2 className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-900">Document Readiness Vault</h3>
            </div>
            <Link to="/documents">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Open Vault
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload resumes, academic transcripts, and recommendation letters to complete mandatory document checks.
          </p>
        </Card>

        {/* Opportunity Preferences Summary */}
        <Card isHoverable={false} className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Sliders className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-900">Opportunity Preferences</h3>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {preferredCategories.map((cat: string) => (
              <Badge key={cat} variant="amber" className="capitalize text-xs">
                {cat}
              </Badge>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
