import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Bookmark
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { OpportunityCard } from '../components/common/OpportunityCard';
import { Opportunity } from '../types/opportunity';
import { dashboardService, DashboardSummaryData } from '../services/dashboardService';
import { matchingService, RecommendedOpportunity } from '../features/matching';
import { useAuthStore } from '../store/authStore';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedOpportunity[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to load dashboard summary:', err);
      setError(err.message || 'Unable to connect to Scolify backend API.');
    } finally {
      setLoading(false);
    }

    // Load recommendations dynamically
    try {
      setLoadingRecommendations(true);
      const recs = await matchingService.getRecommendations(6);
      setRecommendations(recs);
    } catch (recErr) {
      console.warn('Could not load recommendations:', recErr);
      setRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const studentName = summary?.user?.fullName || user?.fullName || 'Student';
  const greetingText = summary?.greeting || `Welcome back, ${studentName}! 👋`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-44 rounded-3xl bg-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="h-64 rounded-3xl bg-slate-200" />
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="p-8 rounded-3xl bg-rose-50/50 border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Unable to load dashboard</h3>
        <p className="text-xs text-slate-600">{error}</p>
        <Button variant="primary" size="sm" onClick={fetchSummary} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Retry Connection
        </Button>
      </div>
    );
  }

  const metrics = summary?.metrics || {
    verifiedOpportunitiesCount: 0,
    applicationsCount: 0,
    savedCount: 0,
    upcomingDeadlinesCount: 0,
    profileCompletionPercentage: 0,
  };

  const opportunities: Opportunity[] = summary?.recentOpportunities || [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-600 p-8 text-white shadow-xl shadow-brand-500/20"
      >
        <div className="relative z-10 space-y-3 max-w-2xl">
          <Badge variant="brand" className="bg-white/20 text-white border-white/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Live Scolify Opportunity Stream
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {greetingText}
          </h1>
          <p className="text-sm text-brand-100 leading-relaxed font-medium">
            Scolify continuously monitors verified scholarships & internships for your canonical student profile.
            {metrics.upcomingDeadlinesCount > 0
              ? ` You have ${metrics.upcomingDeadlinesCount} deadline(s) approaching within the next 30 days!`
              : ' Explore live verified opportunities below.'}
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="md"
              className="bg-white text-brand-700 hover:bg-slate-50 font-bold"
              onClick={() => navigate('/opportunities')}
            >
              Explore Verified Opportunities
            </Button>
            <Button
              variant="ghost"
              size="md"
              className="text-white hover:bg-white/10"
              onClick={() => navigate('/profile')}
            >
              Update Profile Details
            </Button>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

      {/* Dynamic Top Metrics Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card isHoverable={false} className="border-l-4 border-l-brand-500 cursor-pointer" onClick={() => navigate('/opportunities')}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Opportunities</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.verifiedOpportunitiesCount}</h3>
            </div>
            <span className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </span>
          </div>
          <p className="text-xs text-brand-600 font-semibold mt-3">Live verified opportunities</p>
        </Card>

        <Card isHoverable={false} className="border-l-4 border-l-emerald-500 cursor-pointer" onClick={() => navigate('/applications')}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Applications</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.applicationsCount}</h3>
            </div>
            <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-3">Tracked in application hub</p>
        </Card>

        <Card isHoverable={false} className="border-l-4 border-l-amber-500 cursor-pointer" onClick={() => navigate('/reminders')}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Deadlines</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.upcomingDeadlinesCount}</h3>
            </div>
            <span className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <p className="text-xs text-amber-600 font-semibold mt-3">Due in next 30 days</p>
        </Card>

        <Card isHoverable={false} className="border-l-4 border-l-violet-500 cursor-pointer" onClick={() => navigate('/profile')}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Completion</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.profileCompletionPercentage}%</h3>
            </div>
            <span className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <Progress value={metrics.profileCompletionPercentage} showPercentage={false} size="sm" />
          </div>
        </Card>
      </motion.div>

      {/* Profile Completion Guidance Notice */}
      {summary?.profileCompletion && summary.profileCompletion.percentage < 100 && (
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-extrabold text-slate-900">Profile Completion Recommendation</p>
              <p className="text-xs text-slate-600">{summary.profileCompletion.nextAction}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/profile')} className="shrink-0 bg-white">
            Complete Profile
          </Button>
        </motion.div>
      )}

      {/* Recommended For You Section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-brand-100 text-brand-700 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recommended For You</h2>
              <p className="text-xs text-slate-500">
                Opportunities where you satisfy 100% of mandatory criteria, ranked by deterministic compatibility score
              </p>
            </div>
          </div>
        </div>

        {loadingRecommendations ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            <div className="h-44 rounded-3xl bg-slate-200" />
            <div className="h-44 rounded-3xl bg-slate-200" />
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No recommendations available yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Our deterministic engine only recommends verified opportunities where you meet 100% of mandatory eligibility criteria. Complete your academic profile or explore all verified opportunities.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                Complete Profile
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate('/opportunities')}>
                Browse Catalog
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <div key={rec.opportunity.id} className="relative">
                <OpportunityCard opportunity={rec.opportunity} />
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Featured Verified Opportunities Section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Verified Opportunities</h2>
            <p className="text-xs text-slate-500">Real opportunities passing Scolify verification & trust protocols</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/opportunities')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            View All ({metrics.verifiedOpportunitiesCount})
          </Button>
        </div>

        {opportunities.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
            <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No opportunities available yet</h3>
            <p className="text-xs text-slate-500">Run data ingestion or check back soon for newly published records.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
