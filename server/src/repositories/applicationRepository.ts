import { supabaseAdmin } from '../integrations/supabaseClient.js';
import { BaseRepository } from './baseRepository.js';
import { logger } from '../utils/logger.js';

export interface ApplicationDbRecord {
  id: string;
  student_id: string;
  opportunity_id: string;
  status: string;
  match_score?: number | null;
  match_reasoning?: string | null;
  missing_requirements?: any;
  human_approved: boolean;
  approved_at?: string | null;
  submitted_at?: string | null;
  notes?: string | null;
  draft_content?: Record<string, any>;
  application_answers?: Record<string, any>;
  readiness_snapshot?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export class ApplicationRepository extends BaseRepository<ApplicationDbRecord> {
  constructor() {
    super('applications');
  }

  async findByStudentId(studentId: string): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .select('*, opportunities(*), application_documents(*, documents(*))')
      .eq('student_id', studentId)
      .order('updated_at', { ascending: false });

    if (error) {
      logger.error('Failed to query applications for student', { studentId, error });
      return [];
    }

    return data || [];
  }

  async findByIdAndStudent(id: string, studentId: string): Promise<any | null> {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .select('*, opportunities(*), application_documents(*, documents(*))')
      .eq('id', id)
      .eq('student_id', studentId)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  }

  async findByStudentAndOpportunity(studentId: string, opportunityId: string): Promise<any | null> {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .select('*, opportunities(*), application_documents(*, documents(*))')
      .eq('student_id', studentId)
      .eq('opportunity_id', opportunityId)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  }

  async createOrGetApplication(studentId: string, opportunityId: string): Promise<ApplicationDbRecord> {
    const existing = await this.findByStudentAndOpportunity(studentId, opportunityId);
    if (existing) return existing;

    const { data, error } = await supabaseAdmin
      .from('applications')
      .insert({
        student_id: studentId,
        opportunity_id: opportunityId,
        status: 'draft',
        human_approved: false,
        draft_content: {},
        application_answers: {},
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create application draft', { studentId, opportunityId, error });
      throw error;
    }

    return data as ApplicationDbRecord;
  }

  async attachDocument(applicationId: string, documentId: string, purpose: string = 'attachment'): Promise<any> {
    // Check if already attached
    const { data: existing } = await supabaseAdmin
      .from('application_documents')
      .select('*')
      .eq('application_id', applicationId)
      .eq('document_id', documentId)
      .maybeSingle();

    if (existing) {
      return existing;
    }

    const { data, error } = await supabaseAdmin
      .from('application_documents')
      .insert({
        application_id: applicationId,
        document_id: documentId,
        purpose,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to attach document to application', { applicationId, documentId, error });
      throw error;
    }

    return data;
  }

  async detachDocument(applicationId: string, documentId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('application_documents')
      .delete()
      .eq('application_id', applicationId)
      .eq('document_id', documentId);

    return !error;
  }

  async getAttachedDocuments(applicationId: string): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('application_documents')
      .select('*, documents(*)')
      .eq('application_id', applicationId);

    if (error) return [];
    return data || [];
  }

  async updateDraft(applicationId: string, draftType: string, content: any): Promise<any> {
    const app = await this.findById(applicationId);
    if (!app) throw new Error('Application not found');

    const draftContent = app.draft_content || {};
    draftContent[draftType] = content;

    const { data, error } = await supabaseAdmin
      .from('applications')
      .update({
        draft_content: draftContent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async setHumanApproval(applicationId: string, studentId: string, approved: boolean): Promise<any> {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .update({
        human_approved: approved,
        approved_at: approved ? new Date().toISOString() : null,
        status: approved ? 'ready' : 'draft',
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .eq('student_id', studentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const applicationRepository = new ApplicationRepository();
