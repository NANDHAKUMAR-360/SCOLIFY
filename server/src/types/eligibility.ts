export type RuleEvaluationStatus = 'PASS' | 'FAIL' | 'MORE_INFO' | 'UNSUPPORTED';

export type EligibilityStatus = 'ELIGIBLE' | 'INELIGIBLE' | 'MORE_INFO';

export type RequirementOperator =
  | 'EQUALS'
  | 'CONTAINS'
  | 'GREATER_THAN_OR_EQUAL'
  | 'LESS_THAN_OR_EQUAL'
  | 'IN_LIST';

export interface EvaluatedRequirement {
  requirementId?: string;
  type: string; // gpa, degree, field_of_study, year, skill, location, income, age, experience, mandatory_profile_field
  description: string;
  isMandatory: boolean;
  status: RuleEvaluationStatus;
  operator?: RequirementOperator;
  requiredValue: any;
  actualStudentValue: any;
  evidence: string;
  sourceField: string;
  reason?: string;
}

export interface EligibilityResult {
  opportunityId: string;
  opportunityTitle: string;
  organizationName: string;
  status: EligibilityStatus;
  summary: string;
  requirements: EvaluatedRequirement[];
  passedRequirements: number;
  failedRequirements: number;
  missingInformation: number;
  optionalFailedCount: number;
  evaluatedAt: string;
  aiExplanation?: string;
}
