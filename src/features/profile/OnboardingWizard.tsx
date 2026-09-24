import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  GraduationCap,
  Sparkles,
  Award,
  Target,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { profileService } from '../../services/profileService';
import { authStore } from '../../store/authStore';

import { ScolifyLogo } from '../../components/common/ScolifyLogo';

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Form States
  const [basicInfo, setBasicInfo] = useState({
    headline: 'Computer Science Student & AI Enthusiast',
    bio: 'Passionate about machine learning algorithms, research opportunities, and software engineering.',
    country: 'United States',
    state: 'California',
    city: 'Stanford',
    dateOfBirth: '2004-05-15',
  });

  const [educationList, setEducationList] = useState([
    {
      id: 'edu-1',
      institutionName: 'Stanford University',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science & Artificial Intelligence',
      startDate: '2022-09-01',
      endDate: '2026-06-15',
      gpa: 3.85,
      isCurrent: true,
    },
  ]);

  const [newEdu, setNewEdu] = useState({
    institutionName: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '2023-09-01',
    endDate: '2026-06-15',
    gpa: 3.8,
  });

  const [skillsList, setSkillsList] = useState([
    { id: 'sk-1', name: 'Python', level: 'advanced' },
    { id: 'sk-2', name: 'React / TypeScript', level: 'intermediate' },
  ]);
  const [newSkill, setNewSkill] = useState('');

  const [interestsList, setInterestsList] = useState([
    { id: 'int-1', tag: 'Artificial Intelligence' },
    { id: 'int-2', tag: 'Software Engineering' },
  ]);
  const [newInterest, setNewInterest] = useState('');

  const [preferences, setPreferences] = useState<string[]>([
    'scholarship',
    'internship',
    'fellowship',
  ]);

  const [isSaving, setIsSaving] = useState(false);

  // Calculate live completion
  const calculateCompletion = () => {
    let score = 0;
    if (basicInfo.headline && basicInfo.country) score += 25;
    if (educationList.length > 0) score += 25;
    if (skillsList.length >= 2) score += 20;
    else if (skillsList.length === 1) score += 10;
    if (interestsList.length >= 2) score += 15;
    else if (interestsList.length === 1) score += 7;
    if (preferences.length > 0) score += 15;
    return Math.min(100, score);
  };

  const handleNext = async () => {
    setIsSaving(true);
    try {
      if (currentStep === 1) {
        await profileService.updateProfile({
          headline: basicInfo.headline,
          bio: basicInfo.bio,
          country: basicInfo.country,
          state: basicInfo.state,
          city: basicInfo.city,
          dateOfBirth: basicInfo.dateOfBirth,
        });
      } else if (currentStep === 5) {
        await profileService.updateProfile({
          preferredCategories: preferences,
        });
      }
    } catch {
      // Continue wizard locally if dev offline
    } finally {
      setIsSaving(false);
      setCurrentStep((prev) => Math.min(6, prev + 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleAddEducation = async () => {
    if (!newEdu.institutionName || !newEdu.degree) return;
    const item = {
      id: `edu-${Date.now()}`,
      ...newEdu,
      isCurrent: true,
    };
    setEducationList([...educationList, item]);
    try {
      await profileService.addEducation(newEdu);
    } catch {}
    setNewEdu({ institutionName: '', degree: '', fieldOfStudy: '', startDate: '2023-09-01', endDate: '2026-06-15', gpa: 3.8 });
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    const item = { id: `sk-${Date.now()}`, name: newSkill.trim(), level: 'intermediate' };
    setSkillsList([...skillsList, item]);
    try {
      await profileService.addSkill(newSkill.trim());
    } catch {}
    setNewSkill('');
  };

  const handleAddInterest = async () => {
    if (!newInterest.trim()) return;
    const item = { id: `int-${Date.now()}`, tag: newInterest.trim() };
    setInterestsList([...interestsList, item]);
    try {
      await profileService.addInterest(newInterest.trim());
    } catch {}
    setNewInterest('');
  };

  const togglePreference = (cat: string) => {
    if (preferences.includes(cat)) {
      setPreferences(preferences.filter((p) => p !== cat));
    } else {
      setPreferences([...preferences, cat]);
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsSaving(true);
    try {
      await profileService.updateProfile({
        headline: basicInfo.headline,
        bio: basicInfo.bio,
        country: basicInfo.country,
        state: basicInfo.state,
        city: basicInfo.city,
        preferredCategories: preferences,
      });
      const canonical = await profileService.getProfile();
      authStore.setCanonicalProfile(canonical);
    } catch {}
    setIsSaving(false);
    navigate('/dashboard');
  };

  const steps = [
    { num: 1, label: 'Basic Info', icon: <User className="w-4 h-4" /> },
    { num: 2, label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
    { num: 3, label: 'Skills', icon: <Sparkles className="w-4 h-4" /> },
    { num: 4, label: 'Interests', icon: <Award className="w-4 h-4" /> },
    { num: 5, label: 'Preferences', icon: <Target className="w-4 h-4" /> },
    { num: 6, label: 'Review & Finish', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Wizard Header & Progress */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <ScolifyLogo variant="transparent" size="sm" contextBg="light" showTagline={false} className="mb-2" />
            <Badge variant="brand" className="mb-2">
              Step {currentStep} of 6
            </Badge>
            <h1 className="text-2xl font-extrabold text-slate-900">Student Profile Onboarding</h1>
            <p className="text-xs text-slate-500">
              Build your canonical Scolify profile to power AI opportunity intelligence matching.
            </p>
          </div>
          <div className="w-full sm:w-48">
            <Progress value={calculateCompletion()} label="Profile Strength" />
          </div>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-6 gap-2 pt-2 border-t border-slate-100">
          {steps.map((s) => (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl text-[11px] font-bold transition-all ${
                currentStep === s.num
                  ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-2xs'
                  : currentStep > s.num
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-50 text-slate-400'
              }`}
            >
              <span>{s.icon}</span>
              <span className="hidden md:inline line-clamp-1">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step Content Card */}
      <Card isHoverable={false} className="p-8">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800">1. Basic Information</h2>
              <Input
                label="Headline"
                placeholder="Computer Science Student & Research Fellow"
                value={basicInfo.headline}
                onChange={(e) => setBasicInfo({ ...basicInfo, headline: e.target.value })}
              />
              <Textarea
                label="Academic Bio / Overview"
                placeholder="Share your academic interests, focus areas, and aspirations..."
                value={basicInfo.bio}
                onChange={(e) => setBasicInfo({ ...basicInfo, bio: e.target.value })}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input label="Country" value={basicInfo.country} onChange={(e) => setBasicInfo({ ...basicInfo, country: e.target.value })} />
                <Input label="State / Province" value={basicInfo.state} onChange={(e) => setBasicInfo({ ...basicInfo, state: e.target.value })} />
                <Input label="City" value={basicInfo.city} onChange={(e) => setBasicInfo({ ...basicInfo, city: e.target.value })} />
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800">2. Academic Education Records</h2>
              <div className="space-y-3">
                {educationList.map((edu) => (
                  <div key={edu.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{edu.institutionName}</h4>
                      <p className="text-xs font-semibold text-brand-600">{edu.degree} — {edu.fieldOfStudy}</p>
                      <p className="text-[11px] text-slate-500">Start: {edu.startDate} • GPA: {edu.gpa} / 4.0</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-brand-50/50 border border-brand-100 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-brand-800 uppercase tracking-wider">Add Education Record</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="Institution Name" placeholder="Stanford University" value={newEdu.institutionName} onChange={(e) => setNewEdu({ ...newEdu, institutionName: e.target.value })} />
                  <Input label="Degree" placeholder="Bachelor of Science" value={newEdu.degree} onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })} />
                  <Input label="Field of Study" placeholder="Computer Science" value={newEdu.fieldOfStudy} onChange={(e) => setNewEdu({ ...newEdu, fieldOfStudy: e.target.value })} />
                  <Input label="GPA" type="number" step="0.1" value={newEdu.gpa} onChange={(e) => setNewEdu({ ...newEdu, gpa: parseFloat(e.target.value) || 0 })} />
                </div>
                <Button variant="secondary" size="sm" onClick={handleAddEducation} leftIcon={<Plus className="w-4 h-4" />}>
                  Save Education Record
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800">3. Technical & Professional Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((sk) => (
                  <Badge key={sk.id} variant="brand" className="py-1.5 px-3 text-sm">
                    {sk.name}
                    <button onClick={() => setSkillsList(skillsList.filter((s) => s.id !== sk.id))} className="ml-1 text-slate-400 hover:text-rose-600">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input placeholder="Enter skill (e.g. Python, Machine Learning, React)..." value={newSkill} onChange={(e) => setNewSkill(e.target.value)} />
                <Button variant="primary" onClick={handleAddSkill} leftIcon={<Plus className="w-4 h-4" />}>
                  Add Skill
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800">4. Domain Interests & Research Tags</h2>
              <div className="flex flex-wrap gap-2">
                {interestsList.map((int) => (
                  <Badge key={int.id} variant="violet" className="py-1.5 px-3 text-sm">
                    #{int.tag}
                    <button onClick={() => setInterestsList(interestsList.filter((i) => i.id !== int.id))} className="ml-1 text-slate-400 hover:text-rose-600">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input placeholder="Enter interest tag (e.g. AI, Climate Tech, Quantum)..." value={newInterest} onChange={(e) => setNewInterest(e.target.value)} />
                <Button variant="primary" onClick={handleAddInterest} leftIcon={<Plus className="w-4 h-4" />}>
                  Add Tag
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-lg font-bold text-slate-800">5. Opportunity Preferences</h2>
              <p className="text-xs text-slate-500">Select opportunity categories Scolify should match for you:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'scholarship', label: 'Scholarships' },
                  { id: 'internship', label: 'Tech Internships' },
                  { id: 'fellowship', label: 'Fellowships' },
                  { id: 'grant', label: 'Research Grants' },
                  { id: 'competition', label: 'Competitions' },
                  { id: 'career', label: 'Career Roles' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => togglePreference(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all font-semibold text-xs ${
                      preferences.includes(item.id)
                        ? 'bg-brand-50 border-brand-300 text-brand-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Profile Ready!</h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Your canonical student profile has been established with {calculateCompletion()}% strength.
                </p>
              </div>

              <Button variant="gradient" size="lg" onClick={handleCompleteOnboarding} isLoading={isSaving} className="mx-auto px-8" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Go to Intelligence Dashboard
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Footer Navigation */}
        {currentStep < 6 && (
          <div className="flex justify-between items-center pt-8 border-t border-slate-100 mt-8">
            <Button variant="ghost" onClick={handlePrev} disabled={currentStep === 1} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Previous
            </Button>
            <Button variant="primary" onClick={handleNext} isLoading={isSaving} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Save & Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
