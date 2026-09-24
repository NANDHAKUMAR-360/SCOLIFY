import { apiClient } from '../lib/apiClient';
import { Opportunity } from '../types/opportunity';

export interface DashboardMetrics {
  verifiedOpportunitiesCount: number;
  applicationsCount: number;
  savedCount: number;
  upcomingDeadlinesCount: number;
  profileCompletionPercentage: number;
}

export interface DashboardSummaryData {
  greeting: string;
  user: {
    id: string;
    studentId: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    headline?: string;
    country?: string;
  };
  metrics: DashboardMetrics;
  profileCompletion: {
    percentage: number;
    completedSections: string[];
    incompleteSections: string[];
    nextAction: string;
  };
  recentOpportunities: Opportunity[];
  recentApplications: any[];
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummaryData> {
    const res = await apiClient<DashboardSummaryData>('/dashboard/summary');
    return res.data;
  },
};
