// Matching Types for Frontend UI and Services

export type EligibilityStatus = 'ELIGIBLE' | 'INELIGIBLE' | 'MORE_INFO';

export interface FactorScores {
  skillMatch: number;
  educationMatch: number;
  interestMatch: number;
  preferenceMatch: number;
  locationRemote: number;
  deadlineFeasibility: number;
  experienceMatch: number;
  [key: string]: number;
}

export interface MatchExplanationReason {
  description?: string;
  reason?: string;
  sourceField?: string;
}

export interface MatchExplanationData {
  summary?: string;
  eligibilityStatus?: EligibilityStatus;
  reasons?: MatchExplanationReason[];
  missingFields?: MatchExplanationReason[];
  strengths?: string[];
  gaps?: string[];
  matchedCriteria?: Record<string, any>;
  deadlineNote?: string;
  warnings?: string[];
  nextSteps?: string;
}

export interface MatchResultData {
  matchResultId: string;
  opportunityId: string;
  eligibilityStatus: EligibilityStatus;
  overallScore: number | null;
  scoreVersion: string;
  factorScores: FactorScores;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gaps: string[];
  warnings: string[];
  explanation: MatchExplanationData;
  aiExplanation: string | null;
  generatedAt: string;
  updatedAt: string;
  isStale: boolean;
}

export interface RecommendedOpportunity {
  opportunity: any;
  matchScore: number;
  factorScores: FactorScores;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gaps: string[];
  eligibilityStatus: 'ELIGIBLE';
}
