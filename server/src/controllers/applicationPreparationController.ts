import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { profileRepository } from '../repositories/profileRepository.js';
import { profileService } from '../services/profileService.js';
import { opportunityRepository } from '../repositories/opportunityRepository.js';
import { documentRepository } from '../repositories/documentRepository.js';
import { applicationRepository } from '../repositories/applicationRepository.js';
import { applicationReadinessService } from '../services/documents/applicationReadinessService.js';
import { aiWritingService } from '../services/documents/aiWritingService.js';
import { AIDraftType } from '../types/readiness.js';
import { logger } from '../utils/logger.js';

export class ApplicationPreparationController {
  /**
   * GET /api/v1/applications
   * Get all applications for authenticated student
   */
  async getStudentApplications(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const profileData = await profileRepository.findByUserId(user.id);
      if (!profileData) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      const applications = await applicationRepository.findByStudentId(profileData.student.id);

      return res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (err: any) {
      logger.error('Failed to get student applications', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/v1/applications/:applicationId
   * Get application details
   */
  async getApplicationById(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const applicationId = req.params.applicationId as string;
      const profileData = await profileRepository.findByUserId(user.id);
      if (!profileData) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      const application = await applicationRepository.findByIdAndStudent(
        applicationId,
        profileData.student.id
      );


      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found or unauthorized',
        });
      }

      return res.status(200).json({
        success: true,
        data: application,
      });
    } catch (err: any) {
      logger.error('Failed to get application', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/v1/applications/prepare
   * Prepares or retrieves application workspace for an opportunity.
   * DOES NOT SUBMIT APPLICATION.
   */
  async prepareApplication(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { opportunityId } = req.body;
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

      const studentProfile = await profileService.getCanonicalProfile(user.id);
      if (!studentProfile) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      // 1. Get or create application draft
      const application = await applicationRepository.createOrGetApplication(
        profileData.student.id,
        opportunityId
      );

      // 2. Compute live readiness
      const studentDocs = await documentRepository.findByStudentId(profileData.student.id);
      const readiness = await applicationReadinessService.evaluateReadiness(
        studentProfile,
        opportunity,
        studentDocs
      );

      // 3. Get attached documents
      const attachedDocs = await applicationRepository.getAttachedDocuments(application.id);

      return res.status(200).json({
        success: true,
        message: 'Application preparation workspace initialized',
        data: {
          application,
          readiness,
          attachedDocuments: attachedDocs,
          opportunity,
        },
      });
    } catch (err: any) {
      logger.error('Failed to prepare application', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/v1/applications/:applicationId/documents
   * Attach an existing student-owned document to this application
   */
  async attachDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const applicationId = req.params.applicationId as string;
      const { documentId, purpose } = req.body;

      if (!documentId) {
        return res.status(400).json({ success: false, message: 'Document ID is required' });
      }

      const profileData = await profileRepository.findByUserId(user.id);
      if (!profileData) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      // Verify application ownership
      const application = await applicationRepository.findByIdAndStudent(
        applicationId,
        profileData.student.id
      );
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found or unauthorized',
        });
      }

      // Verify document ownership
      const document = await documentRepository.findByIdAndStudent(
        documentId,
        profileData.student.id
      );
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found or unauthorized',
        });
      }

      const attachment = await applicationRepository.attachDocument(
        applicationId,
        documentId,
        purpose || document.document_type
      );

      return res.status(200).json({
        success: true,
        message: 'Document attached successfully to application',
        data: attachment,
      });
    } catch (err: any) {
      logger.error('Failed to attach document', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * DELETE /api/v1/applications/:applicationId/documents/:documentId
   * Detach document from application
   */
  async detachDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const applicationId = req.params.applicationId as string;
      const documentId = req.params.documentId as string;
      const profileData = await profileRepository.findByUserId(user.id);
      if (!profileData) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      // Verify ownership
      const application = await applicationRepository.findByIdAndStudent(
        applicationId,
        profileData.student.id
      );
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found or unauthorized',
        });
      }

      await applicationRepository.detachDocument(applicationId, documentId);

      return res.status(200).json({
        success: true,
        message: 'Document detached from application',
      });
    } catch (err: any) {
      logger.error('Failed to detach document', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/v1/applications/:applicationId/draft/:draftType
   * AI writing assistance using ONLY verified student facts.
   * Requires human approval before use.
   */
  async generateAIDraft(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const applicationId = req.params.applicationId as string;
      const draftType = req.params.draftType as string;
      const { promptGuidance, questionText } = req.body;

      const profileData = await profileRepository.findByUserId(user.id);
      if (!profileData) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      const application = await applicationRepository.findByIdAndStudent(
        applicationId,
        profileData.student.id
      );
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found or unauthorized',
        });
      }

      const opportunity = await opportunityRepository.findById(application.opportunity_id);
      if (!opportunity) {
        return res.status(404).json({ success: false, message: 'Opportunity not found' });
      }

      const studentProfile = await profileService.getCanonicalProfile(user.id);
      if (!studentProfile) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      // Run AI Writing Assistance
      const draftResult = await aiWritingService.generateDraft(
        studentProfile,
        opportunity,
        draftType as AIDraftType,
        { promptGuidance, questionText }
      );

      // Persist draft in application record
      await applicationRepository.updateDraft(applicationId, draftType, draftResult);

      return res.status(200).json({
        success: true,
        message: 'AI Draft generated successfully. Please review and edit before approving.',
        data: draftResult,
      });
    } catch (err: any) {
      logger.error('AI Draft generation error', err);
      return res.status(503).json({
        success: false,
        message: err?.message || 'AI writing assistance failed to generate draft.',
      });
    }
  }

  /**
   * PUT /api/v1/applications/:applicationId/draft
   * Save edited draft content
   */
  async updateDraftContent(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const applicationId = req.params.applicationId as string;
      const { draftType, content } = req.body;

      if (!draftType || content === undefined) {
        return res.status(400).json({
          success: false,
          message: 'draftType and content are required',
        });
      }

      const profileData = await profileRepository.findByUserId(user.id);
      if (!profileData) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      const application = await applicationRepository.findByIdAndStudent(
        applicationId,
        profileData.student.id
      );
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found or unauthorized',
        });
      }

      const updated = await applicationRepository.updateDraft(applicationId, draftType, {
        draftType,
        content,
        editedByUser: true,
        updatedAt: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        message: 'Draft content updated',
        data: updated.draft_content,
      });
    } catch (err: any) {
      logger.error('Failed to update draft content', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * PUT /api/v1/applications/:applicationId/approve
   * Explicit student approval of the prepared application.
   */
  async approveApplication(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const applicationId = req.params.applicationId as string;
      const profileData = await profileRepository.findByUserId(user.id);
      if (!profileData) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      const application = await applicationRepository.findByIdAndStudent(
        applicationId,
        profileData.student.id
      );
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found or unauthorized',
        });
      }

      const updated = await applicationRepository.setHumanApproval(
        applicationId,
        profileData.student.id,
        true
      );

      return res.status(200).json({
        success: true,
        message: 'Application approved by student and marked ready for submission.',
        data: updated,
      });
    } catch (err: any) {
      logger.error('Failed to approve application', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

}

export const applicationPreparationController = new ApplicationPreparationController();
