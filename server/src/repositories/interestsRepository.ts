import { supabaseAdmin } from '../integrations/supabaseClient.js';
import { InterestRecord } from '../types/profile.js';

export class InterestsRepository {
  async listByStudentId(studentId: string): Promise<InterestRecord[]> {
    const { data, error } = await supabaseAdmin
      .from('interests')
      .select('*')
      .eq('student_id', studentId);

    if (error) return [];
    return data || [];
  }

  async create(studentId: string, interestTag: string): Promise<InterestRecord> {
    const { data: created, error } = await supabaseAdmin
      .from('interests')
      .insert({
        student_id: studentId,
        interest_tag: interestTag,
      })
      .select()
      .single();

    if (error) throw error;
    return created;
  }

  async delete(id: string, studentId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('interests')
      .delete()
      .eq('id', id)
      .eq('student_id', studentId);

    return !error;
  }
}

export const interestsRepository = new InterestsRepository();
