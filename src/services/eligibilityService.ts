import { apiClient } from '../lib/apiClient';

export interface EvaluatedRequirementItem {
  requirementId?: string;
  type: string;
  description: string;
  isMandatory: boolean;
  status: 'PASS' | 'FAIL' | 'MORE_INFO' | 'UNSUPPORTED';
  operator?: string;
  requiredValue: any;
  actualStudentValue: any;
  evidence: string;
  sourceField: string;
  reason?: string;
}

export interface EligibilityData {
  opportunityId: string;
  opportunityTitle: string;
  organizationName: string;
  status: 'ELIGIBLE' | 'INELIGIBLE' | 'MORE_INFO';
  summary: string;
  requirements: EvaluatedRequirementItem[];
  passedRequirements: number;
  failedRequirements: number;
  missingInformation: number;
  optionalFailedCount: number;
  evaluatedAt: string;
  aiExplanation?: string;
}

export const eligibilityService = {
  async getEligibility(opportunityId: string): Promise<EligibilityData> {
    const res = await apiClient<EligibilityData>(`/opportunities/${opportunityId}/eligibility`);
    return res.data;
  },
};
