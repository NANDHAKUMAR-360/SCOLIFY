import { supabaseAdmin } from '../integrations/supabaseClient.js';
import { ProfileRecord, StudentRecord } from '../types/profile.js';
import { logger } from '../utils/logger.js';

export class ProfileRepository {
  async findByUserId(userId: string): Promise<{ profile: ProfileRecord; student: StudentRecord } | null> {
    const { data: profile, error: pErr } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (pErr || !profile) return null;

    const { data: student, error: sErr } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('profile_id', userId)
      .maybeSingle();

    if (sErr || !student) return null;

    return { profile, student };
  }

  async ensureProfileExists(userId: string, email: string, fullName: string): Promise<{ profile: ProfileRecord; student: StudentRecord }> {
    // 1. Ensure Profiles record exists
    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      const { data: newProfile, error: pErr } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email,
          full_name: fullName || email.split('@')[0],
        })
        .select()
        .single();

      if (pErr) {
        logger.error('Failed to create profile', pErr);
        throw pErr;
      }
      profile = newProfile;
    }

    // 2. Ensure Student record exists (1-to-1)
    let { data: student } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('profile_id', userId)
      .maybeSingle();

    if (!student) {
      const { data: newStudent, error: sErr } = await supabaseAdmin
        .from('students')
        .insert({
          profile_id: userId,
          completion_percentage: 20,
        })
        .select()
        .single();

      if (sErr) {
        logger.error('Failed to create student record', sErr);
        throw sErr;
      }
      student = newStudent;
    }

    return { profile, student };
  }

  async updateProfileInfo(userId: string, data: Partial<ProfileRecord>): Promise<ProfileRecord> {
    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  async updateStudentInfo(studentId: string, data: Partial<StudentRecord>): Promise<StudentRecord> {
    const { data: updated, error } = await supabaseAdmin
      .from('students')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', studentId)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }
}

export const profileRepository = new ProfileRepository();
