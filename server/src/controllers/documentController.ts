import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { profileRepository } from '../repositories/profileRepository.js';
import { profileService } from '../services/profileService.js';
import { opportunityRepository } from '../repositories/opportunityRepository.js';
import { documentRepository } from '../repositories/documentRepository.js';
import { documentGapService } from '../services/documents/documentGapService.js';
import { certificateGuidanceService } from '../services/documents/certificateGuidanceService.js';
import { applicationReadinessService } from '../services/documents/applicationReadinessService.js';
import { CanonicalDocumentType } from '../types/document.js';
import { logger } from '../utils/logger.js';

export class DocumentController {
  /**
   * GET /api/v1/documents
   * Get all active documents for authenticated student
   */
  async getStudentDocuments(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const profileData = await profileRepository.findByUserId(user.id);
      if (!profileData) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      const docs = await documentRepository.findByStudentId(profileData.student.id);

      // Enhance with signed URLs if available
      const docsWithUrls = await Promise.all(
        docs.map(async (doc) => {
          let signedUrl: string | null = null;
          if (doc.file_path) {
            signedUrl = await documentRepository.getSignedUrl(doc.file_path, 3600);
          }
          return {
            ...doc,
            viewUrl: signedUrl,
          };
        })
      );

      return res.status(200).json({
        success: true,
        data: docsWithUrls,
      });
    } catch (err: any) {
      logger.error('Failed to get student documents', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/v1/documents
   * Upload / register document metadata for authenticated student
   */
  async createDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const profileData = await profileRepository.findByUserId(user.id);
      if (!profileData) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      const { title, documentType, filePath, fileSizeBytes, mimeType, expiryDate, extractedMetadata } =
        req.body;

      if (!title || !documentType) {
        return res.status(400).json({
          success: false,
          message: 'Title and documentType are required',
        });
      }

      // Generate secure path scoped strictly to student if not provided
      const finalPath =
        filePath ||
        `${user.id}/${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;

      const newDoc = await documentRepository.createDocument({
        student_id: profileData.student.id,
        title: title.trim(),
        document_type: documentType as CanonicalDocumentType,
        file_path: finalPath,
        file_size_bytes: fileSizeBytes || 1024,
        mime_type: mimeType || 'application/pdf',
        extracted_metadata: extractedMetadata || {},
        verification_status: 'verified', // standard user uploads are active/verified for gap analysis
        expiry_date: expiryDate || null,
        status: 'active',
        source: 'student_upload',
      });

      return res.status(201).json({
        success: true,
        message: 'Document saved successfully',
        data: newDoc,
      });
    } catch (err: any) {
      logger.error('Failed to create document', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * DELETE /api/v1/documents/:documentId
   * Delete document - strictly checks student ownership
   */
  async deleteDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const documentId = req.params.documentId as string;
      if (!documentId) {
        return res.status(400).json({ success: false, message: 'Document ID is required' });
      }

      const profileData = await profileRepository.findByUserId(user.id);
      if (!profileData) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      // Verify ownership before deleting
      const existing = await documentRepository.findByIdAndStudent(documentId, profileData.student.id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Document not found or you are not authorized to delete it',
        });
      }

      const deleted = await documentRepository.deleteDocument(documentId, profileData.student.id);
      if (!deleted) {
        return res.status(400).json({ success: false, message: 'Failed to delete document' });
      }

      return res.status(200).json({
        success: true,
        message: 'Document removed from vault',
      });
    } catch (err: any) {
      logger.error('Failed to delete document', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/v1/documents/:documentId/signed-url
   * Generate safe signed URL for document viewing
   */
  async getDocumentSignedUrl(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const documentId = req.params.documentId as string;
      const profileData = await profileRepository.findByUserId(user.id);
      if (!profileData) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      const doc = await documentRepository.findByIdAndStudent(documentId, profileData.student.id);
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Document not found or unauthorized' });
      }

      const signedUrl = await documentRepository.getSignedUrl(doc.file_path, 3600);

      return res.status(200).json({
        success: true,
        data: {
          documentId: doc.id,
          title: doc.title,
          signedUrl,
        },
      });
    } catch (err: any) {
      logger.error('Failed to get signed URL', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/v1/opportunities/:opportunityId/documents/gap
   * Deterministic Document Gap Analysis
   */
  async getDocumentGap(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const opportunityId = req.params.opportunityId as string;
      if (!opportunityId) {
        return res.status(400).json({ success: false, message: 'Opportunity ID is required' });
      }

      const opportunity = await opportunityRepository.findById(opportunityId);
      if (!opportunity) {
        return res.status(404).json({ success: false, message: 'Opportunity not found' });
      }

      const profileData = await profileRepository.findByUserId(user.id);
      if (!profileData) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      const studentDocs = await documentRepository.findByStudentId(profileData.student.id);
      const gapAnalysis = documentGapService.analyzeDocumentGap(opportunity, studentDocs);

      return res.status(200).json({
        success: true,
        data: gapAnalysis,
      });
    } catch (err: any) {
      logger.error('Failed to calculate document gap', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/v1/opportunities/:opportunityId/documents/guidance
   * Deterministic Certificate Guidance
   */
  async getCertificateGuidance(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const opportunityId = req.params.opportunityId as string;
      if (!opportunityId) {
        return res.status(400).json({ success: false, message: 'Opportunity ID is required' });
      }

      const opportunity = await opportunityRepository.findById(opportunityId);
      if (!opportunity) {
        return res.status(404).json({ success: false, message: 'Opportunity not found' });
      }

      const profileData = await profileRepository.findByUserId(user.id);
      if (!profileData) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      const studentDocs = await documentRepository.findByStudentId(profileData.student.id);
      const guidance = certificateGuidanceService.generateGuidance(opportunity, studentDocs);

      return res.status(200).json({
        success: true,
        data: guidance,
      });
    } catch (err: any) {
      logger.error('Failed to generate certificate guidance', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/v1/opportunities/:opportunityId/readiness
   * Real Application Readiness
   */
  async getApplicationReadiness(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const opportunityId = req.params.opportunityId as string;
      if (!opportunityId) {
        return res.status(400).json({ success: false, message: 'Opportunity ID is required' });
      }

      const opportunity = await opportunityRepository.findById(opportunityId);
      if (!opportunity) {
        return res.status(404).json({ success: false, message: 'Opportunity not found' });
      }

      const studentProfile = await profileService.getCanonicalProfile(user.id);
      if (!studentProfile) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      const studentDocs = await documentRepository.findByStudentId(studentProfile.student.id);
      const readiness = await applicationReadinessService.evaluateReadiness(
        studentProfile,
        opportunity,
        studentDocs
      );

      return res.status(200).json({
        success: true,
        data: readiness,
      });
    } catch (err: any) {
      logger.error('Failed to calculate application readiness', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

export const documentController = new DocumentController();

