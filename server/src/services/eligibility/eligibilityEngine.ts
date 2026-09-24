import { requirementEvaluator } from './requirementEvaluator.js';
import { StructuredRequirement, ServerOpportunity } from '../../types/opportunity.js';
import { FullCanonicalProfile } from '../../types/profile.js';
import { EligibilityResult, EligibilityStatus, EvaluatedRequirement } from '../../types/eligibility.js';

export class EligibilityEngine {
  public evaluateOpportunityEligibility(
    profile: FullCanonicalProfile,
    opportunity: ServerOpportunity,
    requirements: StructuredRequirement[]
  ): EligibilityResult {
    const evaluatedRequirements: EvaluatedRequirement[] = requirements.map((req) =>
      requirementEvaluator.evaluate(req, profile)
    );

    const mandatory = evaluatedRequirements.filter((r) => r.isMandatory);
    const optional = evaluatedRequirements.filter((r) => !r.isMandatory);

    const mandatoryFailures = mandatory.filter((r) => r.status === 'FAIL');
    const mandatoryMissing = mandatory.filter((r) => r.status === 'MORE_INFO');
    const optionalFailures = optional.filter((r) => r.status === 'FAIL');

    let status: EligibilityStatus = 'ELIGIBLE';
    let summary = '';

    if (mandatoryFailures.length > 0) {
      status = 'INELIGIBLE';
      summary = `You do not meet ${mandatoryFailures.length} mandatory requirement(s) for this opportunity: ${mandatoryFailures
        .map((f) => f.description)
        .join('; ')}.`;
    } else if (mandatoryMissing.length > 0) {
      status = 'MORE_INFO';
      summary = `Additional information is required for ${mandatoryMissing.length} mandatory requirement(s): ${mandatoryMissing
        .map((m) => m.reason || m.description)
        .join('; ')}.`;
    } else {
      status = 'ELIGIBLE';
      if (optionalFailures.length > 0) {
        summary = `You meet all mandatory eligibility criteria! Note: ${optionalFailures.length} optional recommendation(s) were not met (${optionalFailures
          .map((o) => o.description)
          .join(', ')}).`;
      } else {
        summary = `You meet 100% of the mandatory eligibility criteria specified by the sponsor!`;
      }
    }

    const passedRequirements = evaluatedRequirements.filter((r) => r.status === 'PASS').length;
    const failedRequirements = evaluatedRequirements.filter((r) => r.status === 'FAIL').length;
    const missingInformation = evaluatedRequirements.filter((r) => r.status === 'MORE_INFO').length;

    return {
      opportunityId: opportunity.id,
      opportunityTitle: opportunity.title,
      organizationName: opportunity.organization_name,
      status,
      summary,
      requirements: evaluatedRequirements,
      passedRequirements,
      failedRequirements,
      missingInformation,
      optionalFailedCount: optionalFailures.length,
      evaluatedAt: new Date().toISOString(),
    };
  }
}

export const eligibilityEngine = new EligibilityEngine();
