import { Request, Response } from 'express';
import { profileService } from '../services/profileService.js';
import { opportunityService } from '../services/opportunityService.js';
import { savedOpportunitiesRepository } from '../repositories/savedOpportunitiesRepository.js';
import { supabaseAdmin } from '../integrations/supabaseClient.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authenticated session required', 401);
    }

    const userId = req.user.id;
    const userEmail = req.user.email;
    const userFullName = req.user.user_metadata?.full_name;

    // 1. Resolve canonical student profile safely
    let canonicalProfile: any;
    try {
      canonicalProfile = await profileService.getCanonicalProfile(userId, userEmail, userFullName);
    } catch (profileErr) {
      logger.warn('Supabase profile fetch offline fallback in dashboard summary', profileErr);
      canonicalProfile = {
        profile: { id: userId, email: userEmail || '', full_name: userFullName || 'Student' },
        student: { id: userId, headline: 'Student Profile', completion_percentage: 50 },
        completion: {
          percentage: 50,
          completedSections: ['Basic Info'],
          incompleteSections: ['Academic Education'],
          nextAction: 'Complete onboarding wizard to boost opportunity match accuracy.',
        },
      };
    }

    const studentId = canonicalProfile.student?.id || userId;
    const fullName = canonicalProfile.profile?.full_name || userFullName || 'Student';

    // 2. Dynamic time-of-day greeting
    const hour = new Date().getHours();
    let timeOfDay = 'morning';
    if (hour >= 12 && hour < 17) {
      timeOfDay = 'afternoon';
    } else if (hour >= 17) {
      timeOfDay = 'evening';
    }
    const greeting = `Good ${timeOfDay}, ${fullName}!`;

    // 3. Query real verified opportunities from repository
    let oppResult: { items: any[]; total: number } = { items: [], total: 0 };
    try {
      oppResult = await opportunityService.getOpportunities({
        studentId,
        limit: 10,
      });
    } catch (oppErr) {
      logger.warn('Opportunity fetch fallback in dashboard summary', oppErr);
    }

    // 4. Query student's active applications safely
    let applications: any[] = [];
    try {
      const { data } = await supabaseAdmin
        .from('applications')
        .select('*, opportunity:opportunities(*)')
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false });
      applications = data || [];
    } catch (appErr) {
      logger.warn('Applications fetch fallback in dashboard summary', appErr);
    }
    const applicationsCount = applications.length;

    // 5. Query student's saved opportunities safely
    let savedOpportunityIds: string[] = [];
    try {
      savedOpportunityIds = await savedOpportunitiesRepository.listSavedByStudent(studentId);
    } catch (saveErr) {
      logger.warn('Saved opportunities fetch fallback in dashboard summary', saveErr);
    }
    const savedCount = savedOpportunityIds.length;

    // 6. Calculate real upcoming deadlines within next 30 days
    const now = new Date();
    const inThirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingDeadlinesCount = oppResult.items.filter((opp) => {
      if (!opp.application_deadline) return false;
      const d = new Date(opp.application_deadline);
      return d >= now && d <= inThirtyDays;
    }).length;

    return sendSuccess(res, {
      greeting,
      user: {
        id: userId,
        studentId,
        email: canonicalProfile.profile?.email || userEmail,
        fullName: canonicalProfile.profile?.full_name || fullName,
        avatarUrl: canonicalProfile.profile?.avatar_url,
        headline: canonicalProfile.student?.headline,
        country: canonicalProfile.student?.country,
      },
      metrics: {
        verifiedOpportunitiesCount: oppResult.total,
        applicationsCount,
        savedCount,
        upcomingDeadlinesCount,
        profileCompletionPercentage: canonicalProfile.completion?.percentage || 0,
      },
      profileCompletion: canonicalProfile.completion,
      recentOpportunities: oppResult.items.slice(0, 5),
      recentApplications: applications.slice(0, 5),
    });
  } catch (err: any) {
    logger.error('Error fetching dashboard summary', err);
    return sendError(res, 'DASHBOARD_ERROR', 'Failed to retrieve dashboard summary', 500);
  }
};
