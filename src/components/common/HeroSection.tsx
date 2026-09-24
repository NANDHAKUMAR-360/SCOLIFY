import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Target,
  CheckCircle2,
  UserCheck,
  GraduationCap,
  Briefcase,
  FlaskConical,
  Trophy,
  Coins,
  ChevronDown
} from 'lucide-react';

import { publicExperienceContent } from '../../config/publicExperience';
import { ScolifyLogo } from './ScolifyLogo';

interface HeroSectionProps {
  onCategorySelect?: (category: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onCategorySelect,
}) => {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('all');



  const handleCategoryClick = (catVal: string) => {
    setActiveCategory(catVal);
    if (onCategorySelect) {
      onCategorySelect(catVal);
    } else if (catVal === 'scholarship') {
      navigate('/scholarships');
    } else if (catVal === 'internship') {
      navigate('/internships');
    } else if (catVal !== 'all') {
      navigate(`/opportunities?category=${catVal}`);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap className="w-3.5 h-3.5" />;
      case 'Briefcase': return <Briefcase className="w-3.5 h-3.5" />;
      case 'FlaskConical': return <FlaskConical className="w-3.5 h-3.5" />;
      case 'Trophy': return <Trophy className="w-3.5 h-3.5" />;
      case 'Coins': return <Coins className="w-3.5 h-3.5" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-yellow-400" />;
    }
  };

  const getTrustIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-brand-600" />;
      case 'Target': return <Target className="w-6 h-6 text-indigo-600" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      default: return <UserCheck className="w-6 h-6 text-violet-600" />;
    }
  };

  return (
    <section id="hero" className="relative pt-12 pb-16 px-4 lg:px-8 max-w-7xl mx-auto w-full overflow-hidden min-h-[85vh] flex flex-col justify-between scroll-mt-20">
      {/* Soft Oval Organic Background Shape behind Hero */}
      <div className="w-[680px] sm:w-[850px] h-[360px] sm:h-[420px] bg-gradient-to-r from-brand-400/20 via-indigo-400/25 to-cyan-400/20 rounded-[100%] blur-3xl absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10" />

      {/* Main Centered Hero Content */}
      <div className="text-center space-y-6 max-w-4xl mx-auto z-10 pt-4">
        {/* scolify logo floating card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-2"
        >
          <ScolifyLogo
            variant="with-bg"
            size="lg"
            contextBg="card"
            showTagline={false}
            className="shadow-xl rounded-3xl p-3 bg-white border border-slate-100/80"
          />
        </motion.div>

        {/* Centered Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-50 via-indigo-50 to-cyan-50 border border-brand-200/80 text-brand-700 text-xs font-extrabold shadow-2xs"
        >
          <Sparkles className="w-4 h-4 text-brand-600" />
          {publicExperienceContent.hero.badge}
        </motion.div>

        {/* Centered Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.15]"
        >
          {publicExperienceContent.hero.titleLine1} <br />
          <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
            {publicExperienceContent.hero.titleHighlight}
          </span>
        </motion.h1>

        {/* Supporting Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium"
        >
          {publicExperienceContent.hero.subtitle}
        </motion.p>



        {/* Category Pills below Search */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap justify-center items-center gap-2 pt-2"
        >
          {publicExperienceContent.categoryPills.map((pill) => {
            const isActive = activeCategory === pill.categoryValue;
            return (
              <button
                key={pill.id}
                onClick={() => handleCategoryClick(pill.categoryValue)}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {getCategoryIcon(pill.iconName)}
                <span>{pill.label}</span>
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* Trust Principles Cards (Honest non-numeric trust cards) */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="pt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto w-full z-10"
      >
        {publicExperienceContent.trustCards.map((card) => (
          <div
            key={card.id}
            className="p-5 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100 shadow-card-soft space-y-2 text-center hover:border-brand-200 transition-all"
          >
            <div className="p-2.5 bg-slate-50 rounded-2xl w-fit mx-auto">
              {getTrustIcon(card.iconName)}
            </div>
            <h3 className="text-xs font-extrabold text-slate-900">{card.title}</h3>
            <p className="text-[11px] text-slate-500 leading-tight font-medium">{card.description}</p>
          </div>
        ))}
      </motion.div>

      {/* Scroll Down Indicator */}
      <div className="pt-8 text-center z-10">
        <a
          href="#opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand-600 transition-colors"
        >
          <span>Scroll Down to Explore</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
};
