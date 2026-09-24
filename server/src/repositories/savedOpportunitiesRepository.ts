import { supabaseAdmin } from '../integrations/supabaseClient.js';
import { BaseRepository } from './baseRepository.js';

export interface SavedOpportunityRecord {
  id: string;
  student_id: string;
  opportunity_id: string;
  notes?: string;
  created_at: string;
}

export class SavedOpportunitiesRepository extends BaseRepository<SavedOpportunityRecord> {
  constructor() {
    super('saved_opportunities');
  }

  async listSavedByStudent(studentId: string): Promise<string[]> {
    const { data, error } = await supabaseAdmin
      .from('saved_opportunities')
      .select('opportunity_id')
      .eq('student_id', studentId);

    if (error || !data) return [];
    return data.map((d) => d.opportunity_id);
  }

  async saveOpportunity(studentId: string, opportunityId: string, notes?: string): Promise<SavedOpportunityRecord> {
    const { data, error } = await supabaseAdmin
      .from('saved_opportunities')
      .upsert({
        student_id: studentId,
        opportunity_id: opportunityId,
        notes: notes || '',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async unsaveOpportunity(studentId: string, opportunityId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('saved_opportunities')
      .delete()
      .eq('student_id', studentId)
      .eq('opportunity_id', opportunityId);

    return !error;
  }
}

export const savedOpportunitiesRepository = new SavedOpportunitiesRepository();
