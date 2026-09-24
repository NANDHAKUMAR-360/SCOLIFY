// Matching Explanation Service – Phase E
// Groq is an EXPLANATION LAYER ONLY.
// It must NOT calculate eligibility, score, change weights, or invent facts.

import { groqClient } from '../../integrations/groqClient.js';
import { logger } from '../../utils/logger.js';
import { FullCanonicalProfile } from '../../types/profile.js';
import { ServerOpportunity } from '../../types/opportunity.js';
import { EligibilityResult } from '../../types/eligibility.js';

export interface ExplanationInput {
  profile: FullCanonicalProfile;
  opportunity: ServerOpportunity;
  eligibility: EligibilityResult;
  score: number | null;
  factorScores: Record<string, number>;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gaps: string[];
}

export class MatchingExplanationService {
  /**
   * Calls Groq to produce a natural-language explanation based strictly on the deterministic findings.
   * If Groq fails or is unavailable, returns null. Deterministic explanation remains authoritative.
   */
  async generateMatchExplanation(input: ExplanationInput): Promise<string | null> {
    if (!groqClient.isAvailable()) {
      return null;
    }

    try {
      const { profile, opportunity, eligibility, score, factorScores, matchedSkills, missingSkills, strengths, gaps } = input;

      const systemPrompt = `You are Scolify Match Explainer, a trusted student opportunity advisor.
CRITICAL RULES:
1. You are strictly an EXPLANATION LAYER. You CANNOT calculate scores, alter eligibility, modify factor weights, or invent requirements.
2. The deterministic score is ${score ?? 0}% and eligibility status is ${eligibility.status}. You MUST NOT contradict these facts.
3. Be concise (2-3 sentences max). Tone must be supportive, professional, and transparent.
4. State the student's key strengths and any specific skill/qualification gaps objectively.`;

      const userPrompt = `Explain why the student received this match outcome:
- Opportunity: "${opportunity.title}" by ${opportunity.organization_name}
- Eligibility Status: ${eligibility.status}
- Deterministic Match Score: ${score ?? 0}%
- Factor Breakdown: ${JSON.stringify(factorScores)}
- Matched Skills: ${matchedSkills.length > 0 ? matchedSkills.join(', ') : 'None'}
- Missing Skills: ${missingSkills.length > 0 ? missingSkills.join(', ') : 'None'}
- Key Strengths: ${strengths.length > 0 ? strengths.join('; ') : 'General fit'}
- Identified Gaps: ${gaps.length > 0 ? gaps.join('; ') : 'None'}`;

      const completion = await groqClient.generateCompletion(userPrompt, systemPrompt);
      if (completion?.text) {
        return completion.text.trim();
      }
      return null;
    } catch (err: any) {
      logger.warn('Groq matching explanation generation failed, falling back to deterministic explanation:', err?.message || err);
      return null;
    }
  }
}

export const matchingExplanationService = new MatchingExplanationService();
