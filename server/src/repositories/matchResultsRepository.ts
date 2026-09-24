// Repository for match_results table
import { supabaseAdmin } from '../integrations/supabaseClient.js';
import { MatchResultInsert, MatchResultRecord } from '../types/matchResult.js';
import { MATCH_SCORE_VERSION } from '../config/matchConfig.js';

export class MatchResultsRepository {
  /**
   * Upserts a match result for a student + opportunity + score_version combination.
   * If a result already exists, it updates scores, factors, explanations, and sets is_stale = false.
   */
  async upsertMatchResult(data: MatchResultInsert): Promise<MatchResultRecord> {
    const scoreVersion = data.score_version || MATCH_SCORE_VERSION;
    const now = new Date().toISOString();

    const payload = {
      student_id: data.student_id,
      opportunity_id: data.opportunity_id,
      eligibility_status: data.eligibility_status,
      score: data.score,
      score_version: scoreVersion,
      factor_scores: data.factor_scores || {},
      matched_skills: data.matched_skills || [],
      missing_skills: data.missing_skills || [],
      matched_criteria: data.matched_criteria || {},
      strengths: data.strengths || [],
      gaps: data.gaps || [],
      warnings: data.warnings || [],
      explanation: data.explanation || {},
      ai_explanation: data.ai_explanation ?? null,
      is_stale: false,
      updated_at: now,
    };

    const { data: upserted, error } = await supabaseAdmin
      .from('match_results')
      .upsert(payload, {
        onConflict: 'student_id,opportunity_id,score_version',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    return upserted as MatchResultRecord;
  }

  /**
   * Retrieves the latest, non-stale match result for a student and opportunity.
   */
  async getLatestMatchResult(
    studentId: string,
    opportunityId: string,
    scoreVersion = MATCH_SCORE_VERSION
  ): Promise<MatchResultRecord | null> {
    const { data, error } = await supabaseAdmin
      .from('match_results')
      .select('*')
      .eq('student_id', studentId)
      .eq('opportunity_id', opportunityId)
      .eq('score_version', scoreVersion)
      .eq('is_stale', false)
      .order('updated_at', { ascending: false })
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return data as MatchResultRecord;
  }

  /**
   * Marks previous match results for a student as stale when their profile changes.
   */
  async markStaleForStudent(studentId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('match_results')
      .update({ is_stale: true, updated_at: new Date().toISOString() })
      .eq('student_id', studentId);

    if (error) {
      console.warn('Failed to mark match results stale for student:', studentId, error);
    }
  }

  /**
   * Marks match results for an opportunity as stale when the opportunity criteria change.
   */
  async markStaleForOpportunity(opportunityId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('match_results')
      .update({ is_stale: true, updated_at: new Date().toISOString() })
      .eq('opportunity_id', opportunityId);

    if (error) {
      console.warn('Failed to mark match results stale for opportunity:', opportunityId, error);
    }
  }

  // Deprecated insert alias preserved for backwards compatibility
  async insertMatchResult(data: MatchResultInsert): Promise<MatchResultRecord> {
    return this.upsertMatchResult(data);
  }
}

export const matchResultsRepository = new MatchResultsRepository();
