import { profileService } from '../profileService.js';
import { opportunityService } from '../opportunityService.js';
import { eligibilityEngine } from './eligibilityEngine.js';
import { eligibilityExplanationService } from './eligibilityExplanationService.js';
import { supabaseAdmin } from '../../integrations/supabaseClient.js';
import { EligibilityResult } from '../../types/eligibility.js';
import { StructuredRequirement } from '../../types/opportunity.js';

export class EligibilityService {
  async evaluateStudentEligibility(
    userId: string,
    opportunityId: string,
    includeAiExplanation = true
  ): Promise<EligibilityResult> {
    // 1. Resolve Authenticated Student Profile
    const profile = await profileService.getCanonicalProfile(userId);

    // 2. Load Opportunity Details
    const opportunity = await opportunityService.getOpportunityById(opportunityId);
    if (!opportunity) {
      throw new Error(`Opportunity '${opportunityId}' not found.`);
    }

    // 3. Trust Boundary Verification (Prompt Section 7)
    const isVerified = opportunity.verification_status === 'verified';
    const isPublished = opportunity.lifecycle_status === 'published' || opportunity.lifecycle_status === undefined || opportunity.lifecycle_status === null;
    const isActive = opportunity.is_active !== false;
    const isNotExpired = opportunity.expiry_status !== 'expired';

    if (!isVerified || !isPublished || !isActive || !isNotExpired) {
      throw new Error(
        `Eligibility evaluation unavailable: Opportunity is not active, verified, or published (verification: ${opportunity.verification_status}, lifecycle: ${opportunity.lifecycle_status}, expiry: ${opportunity.expiry_status}).`
      );
    }

    // 4. Load Requirements from Database
    let requirements: StructuredRequirement[] = opportunity.requirements || [];

    if (requirements.length === 0) {
      try {
        const { data, error } = await supabaseAdmin
          .from('opportunity_requirements')
          .select('*')
          .eq('opportunity_id', opportunityId);

        if (!error && data && data.length > 0) {
          requirements = data as StructuredRequirement[];
        }
      } catch {
        // Fallback to default requirement if empty
      }
    }

    // Default sample requirement if database record has no requirements attached
    if (requirements.length === 0) {
      requirements = [
        {
          requirement_type: 'gpa',
          criteria_json: { field: 'cgpa', operator: 'GREATER_THAN_OR_EQUAL', value: 3.0, unit: 'GPA' },
          is_mandatory: true,
        },
      ];
    }

    // 5. Deterministic Eligibility Engine Evaluation
    const result = eligibilityEngine.evaluateOpportunityEligibility(profile, opportunity, requirements);

    // 6. Optional Natural Language Explanation Layer
    if (includeAiExplanation) {
      result.aiExplanation = await eligibilityExplanationService.generateExplanation(result);
    }

    return result;
  }
}

export const eligibilityService = new EligibilityService();
