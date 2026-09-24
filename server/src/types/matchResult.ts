// Types for match results and API responses
export interface MatchResultRecord {
  id: string;
  student_id: string;
  opportunity_id: string;
  eligibility_status: string;
  score: number | null;
  score_version: string;
  factor_scores: Record<string, number>;
  matched_skills: string[];
  missing_skills: string[];
  matched_criteria: Record<string, any>;
  strengths: string[];
  gaps: string[];
  warnings: string[];
  explanation: Record<string, any>;
  ai_explanation: string | null;
  is_stale: boolean;
  generated_at: string;
  updated_at: string;
}

export interface MatchResultInsert {
  id?: string;
  student_id: string;
  opportunity_id: string;
  eligibility_status: string;
  score: number | null;
  score_version: string;
  factor_scores: Record<string, number>;
  matched_skills?: string[];
  missing_skills?: string[];
  matched_criteria?: Record<string, any>;
  strengths?: string[];
  gaps?: string[];
  warnings?: string[];
  explanation?: Record<string, any>;
  ai_explanation?: string | null;
  is_stale?: boolean;
  generated_at?: string;
  updated_at?: string;
}

export interface MatchResultResponseData {
  matchResultId: string;
  opportunityId: string;
  eligibilityStatus: string;
  overallScore: number | null;
  scoreVersion: string;
  factorScores: Record<string, number>;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gaps: string[];
  warnings: string[];
  explanation: Record<string, any>;
  aiExplanation: string | null;
  generatedAt: string;
  updatedAt: string;
  isStale: boolean;
}

export function formatMatchResultResponse(row: MatchResultRecord): MatchResultResponseData {
  return {
    matchResultId: row.id,
    opportunityId: row.opportunity_id,
    eligibilityStatus: row.eligibility_status,
    overallScore: row.score,
    scoreVersion: row.score_version,
    factorScores: row.factor_scores || {},
    matchedSkills: row.matched_skills || [],
    missingSkills: row.missing_skills || [],
    strengths: row.strengths || [],
    gaps: row.gaps || [],
    warnings: row.warnings || [],
    explanation: row.explanation || {},
    aiExplanation: row.ai_explanation ?? null,
    generatedAt: row.generated_at,
    updatedAt: row.updated_at,
    isStale: Boolean(row.is_stale),
  };
}
