import { groqClient } from '../../integrations/groqClient.js';
import { EligibilityResult } from '../../types/eligibility.js';
import { logger } from '../../utils/logger.js';

export class EligibilityExplanationService {
  async generateExplanation(result: EligibilityResult): Promise<string> {
    const defaultFallback = this.createFallbackExplanation(result);

    try {
      const prompt = `
Explain this student's eligibility evaluation result in 2 concise, clear sentences.

DETERMINISTIC RESULT:
Status: ${result.status}
Summary: ${result.summary}
Passed Requirements (${result.passedRequirements}): ${result.requirements.filter(r => r.status === 'PASS').map(r => r.description).join(', ')}
Failed Requirements (${result.failedRequirements}): ${result.requirements.filter(r => r.status === 'FAIL').map(r => r.description).join(', ')}
Missing Requirements (${result.missingInformation}): ${result.requirements.filter(r => r.status === 'MORE_INFO').map(r => r.description).join(', ')}
`;

      const systemPrompt = `You are Scolify AI, an AI student opportunity advisor. You MUST NEVER change the eligibility status (${result.status}), passed rules, or failed rules. Summarize the deterministic findings clearly for the student.`;

      const completion = await groqClient.generateCompletion(prompt, systemPrompt);
      if (completion && completion.text) {
        return completion.text.trim();
      }
    } catch (err: any) {
      logger.info('Groq AI explanation skipped or failed - returning deterministic fallback explanation', err);
    }

    return defaultFallback;
  }

  private createFallbackExplanation(result: EligibilityResult): string {
    if (result.status === 'ELIGIBLE') {
      return `Congratulations! Your academic profile satisfies all mandatory eligibility requirements for ${result.opportunityTitle}.`;
    } else if (result.status === 'INELIGIBLE') {
      return `You do not currently satisfy the mandatory eligibility criteria for ${result.opportunityTitle}. Please check the requirement breakdown below.`;
    } else {
      return `Additional profile details are required to evaluate your complete eligibility for ${result.opportunityTitle}.`;
    }
  }
}

export const eligibilityExplanationService = new EligibilityExplanationService();
