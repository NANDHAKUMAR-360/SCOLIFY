import { supabaseAdmin } from '../integrations/supabaseClient.js';
import { EducationRecord } from '../types/profile.js';

export class EducationRepository {
  async listByStudentId(studentId: string): Promise<EducationRecord[]> {
    const { data, error } = await supabaseAdmin
      .from('education')
      .select('*')
      .eq('student_id', studentId)
      .order('start_date', { ascending: false });

    if (error) return [];
    return data || [];
  }

  async create(studentId: string, data: Omit<EducationRecord, 'id' | 'student_id' | 'created_at'>): Promise<EducationRecord> {
    const { data: created, error } = await supabaseAdmin
      .from('education')
      .insert({
        student_id: studentId,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return created;
  }

  async update(id: string, studentId: string, data: Partial<EducationRecord>): Promise<EducationRecord> {
    const { data: updated, error } = await supabaseAdmin
      .from('education')
      .update(data)
      .eq('id', id)
      .eq('student_id', studentId)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  async delete(id: string, studentId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('education')
      .delete()
      .eq('id', id)
      .eq('student_id', studentId);

    return !error;
  }
}

export const educationRepository = new EducationRepository();
