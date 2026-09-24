import { apiClient, ApiClientError } from '../../../lib/apiClient';
import { MatchResultData, RecommendedOpportunity } from '../types/matching';

export const matchingService = {
  /**
   * Executes or recalculates deterministic match for an opportunity.
   * Calls POST /api/v1/match/:opportunityId
   */
  async runMatch(opportunityId: string): Promise<MatchResultData> {
    const res = await apiClient<MatchResultData>(`/match/${opportunityId}`, {
      method: 'POST',
    });
    return res.data;
  },

  /**
   * Retrieves the latest stored match result for an opportunity.
   * Calls GET /api/v1/match/latest/:opportunityId
   * Returns null if no match has been calculated yet (404).
   */
  async getLatestMatch(opportunityId: string): Promise<MatchResultData | null> {
    try {
      const res = await apiClient<MatchResultData>(`/match/latest/${opportunityId}`, {
        method: 'GET',
      });
      return res.data;
    } catch (err: any) {
      if (err instanceof ApiClientError && (err.code === 'NOT_FOUND' || err.code === 'HTTP_404')) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Retrieves student opportunity recommendations ranked strictly by deterministic match score.
   * Calls GET /api/v1/recommendations
   */
  async getRecommendations(limit = 10): Promise<RecommendedOpportunity[]> {
    const res = await apiClient<RecommendedOpportunity[]>(`/recommendations?limit=${limit}`, {
      method: 'GET',
    });
    return res.data || [];
  },
};
