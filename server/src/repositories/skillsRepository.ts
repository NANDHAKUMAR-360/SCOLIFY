import { supabaseAdmin } from '../integrations/supabaseClient.js';
import { SkillRecord } from '../types/profile.js';

export class SkillsRepository {
  async listByStudentId(studentId: string): Promise<SkillRecord[]> {
    const { data, error } = await supabaseAdmin
      .from('skills')
      .select('*')
      .eq('student_id', studentId);

    if (error) return [];
    return data || [];
  }

  async create(studentId: string, skillName: string, proficiencyLevel: string = 'intermediate'): Promise<SkillRecord> {
    const { data: created, error } = await supabaseAdmin
      .from('skills')
      .insert({
        student_id: studentId,
        skill_name: skillName,
        proficiency_level: proficiencyLevel,
      })
      .select()
      .single();

    if (error) throw error;
    return created;
  }

  async delete(id: string, studentId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('skills')
      .delete()
      .eq('id', id)
      .eq('student_id', studentId);

    return !error;
  }
}

export const skillsRepository = new SkillsRepository();
