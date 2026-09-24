import { supabaseAdmin } from '../integrations/supabaseClient.js';
import { BaseRepository } from './baseRepository.js';
import { DocumentRecord, CanonicalDocumentType } from '../types/document.js';
import { logger } from '../utils/logger.js';

export class DocumentRepository extends BaseRepository<DocumentRecord> {
  private bucketName = 'student-documents';

  constructor() {
    super('documents');
  }

  /**
   * Find all active documents owned by student
   */
  async findByStudentId(studentId: string): Promise<DocumentRecord[]> {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('student_id', studentId)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch documents for student', { studentId, error });
      return [];
    }

    return (data as DocumentRecord[]) || [];
  }

  /**
   * Find document by ID ensuring student ownership
   */
  async findByIdAndStudent(id: string, studentId: string): Promise<DocumentRecord | null> {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('student_id', studentId)
      .neq('status', 'deleted')
      .maybeSingle();

    if (error || !data) return null;
    return data as DocumentRecord;
  }

  /**
   * Find active document by specific canonical type
   */
  async findByType(studentId: string, documentType: CanonicalDocumentType): Promise<DocumentRecord[]> {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('student_id', studentId)
      .eq('document_type', documentType)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data as DocumentRecord[]) || [];
  }

  /**
   * Create document record
   */
  async createDocument(doc: Partial<DocumentRecord>): Promise<DocumentRecord> {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert({
        student_id: doc.student_id,
        title: doc.title,
        document_type: doc.document_type,
        file_path: doc.file_path,
        file_size_bytes: doc.file_size_bytes || 0,
        mime_type: doc.mime_type || 'application/pdf',
        extracted_metadata: doc.extracted_metadata || {},
        is_verified: doc.is_verified || false,
        verification_status: doc.verification_status || 'unverified',
        expiry_date: doc.expiry_date || null,
        status: doc.status || 'active',
        source: doc.source || 'student_upload',
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create document record', { error, doc });
      throw error;
    }

    return data as DocumentRecord;
  }

  /**
   * Soft delete document with strict student ownership check
   */
  async deleteDocument(id: string, studentId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .update({
        status: 'deleted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('student_id', studentId)
      .select()
      .maybeSingle();

    if (error || !data) {
      return false;
    }
    return true;
  }

  /**
   * Generate private temporary signed URL for safe file access (never exposes public URL)
   */
  async getSignedUrl(filePath: string, expiresInSeconds: number = 3600): Promise<string | null> {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresInSeconds);

      if (error || !data?.signedUrl) {
        logger.warn('Failed to generate signed URL from storage', { filePath, error });
        return null;
      }

      return data.signedUrl;
    } catch (err) {
      logger.warn('Storage signed URL generation error', err);
      return null;
    }
  }
}

export const documentRepository = new DocumentRepository();
