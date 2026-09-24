// Recommendation Service – Phase G
// Evaluates candidates strictly against deterministic eligibility and ranks by deterministic score

import { opportunityRepository } from '../repositories/opportunityRepository.js';
import { profileService } from './profileService.js';
import { eligibilityService } from './eligibility/eligibilityService.js';
import { matchEngineService } from './matching/matchEngine.js';
import { ServerOpportunity } from '../types/opportunity.js';
import { FullCanonicalProfile } from '../types/profile.js';
import { logger } from '../utils/logger.js';

export interface RecommendedOpportunityItem {
  opportunity: ServerOpportunity;
  matchScore: number;
  factorScores: Record<string, number>;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gaps: string[];
  eligibilityStatus: 'ELIGIBLE';
}

export class RecommendationService {
  /**
   * Generates student opportunity recommendations.
   * Hard Gated: Candidates must be verified, active, published, unexpired, and strictly ELIGIBLE.
   * Ranked purely by deterministic match score. AI is NEVER used to rank opportunities.
   */
  async getRecommendations(userId: string, studentId: string, limit = 10): Promise<RecommendedOpportunityItem[]> {
    const profile: FullCanonicalProfile = await profileService.getCanonicalProfile(userId);
    const resolvedStudentId = profile.student?.id || studentId;

    // 1. Fetch genuine verified opportunities passing publication criteria
    const { items: candidates } = await opportunityRepository.queryOpportunities({
      verificationStatus: 'verified',
      lifecycleStatus: 'published',
      limit: 50,
    });

    const recommendations: RecommendedOpportunityItem[] = [];

    // 2. Evaluate candidates deterministically
    for (const opp of candidates) {
      // Trust boundary check
      if (
        opp.is_active === false ||
        opp.expiry_status === 'expired' ||
        opp.verification_status !== 'verified'
      ) {
        continue;
      }

      // Strict Deterministic Eligibility Hard Gate
      try {
        const eligibility = await eligibilityService.evaluateStudentEligibility(userId, opp.id, false);
        if (eligibility.status !== 'ELIGIBLE') {
          continue; // Ineligible or More Info candidates can NEVER be recommended
        }

        // 3. Deterministic Match Score Calculation
        const matchPayload = matchEngineService.computeEligibleMatch(
          resolvedStudentId,
          profile,
          opp,
          eligibility
        );

        recommendations.push({
          opportunity: opp,
          matchScore: matchPayload.score ?? 0,
          factorScores: matchPayload.factor_scores,
          matchedSkills: matchPayload.matched_skills || [],
          missingSkills: matchPayload.missing_skills || [],
          strengths: matchPayload.strengths || [],
          gaps: matchPayload.gaps || [],
          eligibilityStatus: 'ELIGIBLE',
        });
      } catch (err: any) {
        logger.info(`Skipping candidate ${opp.id} from recommendations:`, err?.message);
        continue;
      }
    }

    // 4. Deterministic Sort: Descending by matchScore
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    return recommendations.slice(0, limit);
  }
}

export const recommendationService = new RecommendationService();
