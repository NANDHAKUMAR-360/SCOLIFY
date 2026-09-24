import {
  CanonicalDocumentType,
  DocumentRecord,
  DocumentGapItem,
  DocumentGapAnalysis,
  DocumentReadinessStatus,
  DOCUMENT_TYPE_LABELS,
} from '../../types/document.js';
import { ServerOpportunity, StructuredRequirement } from '../../types/opportunity.js';

export class DocumentGapService {
  /**
   * Deterministically analyze document gaps for a student against a specific opportunity.
   * NEVER infers that a document exists.
   * NEVER marks a missing document as available.
   */
  analyzeDocumentGap(
    opportunity: ServerOpportunity,
    studentDocuments: DocumentRecord[]
  ): DocumentGapAnalysis {
    const opportunityId = opportunity.id;
    const requirements = opportunity.requirements || (opportunity as any).opportunity_requirements || [];


    // 1. Identify all document / certificate requirements
    const docRequirements = this.extractDocumentRequirements(opportunity, requirements);

    // If no document requirements exist
    if (docRequirements.length === 0) {
      return {
        opportunityId,
        opportunityTitle: opportunity.title,
        requiredDocuments: [],
        availableDocuments: [],
        missingDocuments: [],
        expiredDocuments: [],
        pendingVerificationDocuments: [],
        readinessStatus: 'NOT_APPLICABLE',
        completionPercentage: 100,
        warnings: [],
      };
    }

    const availableDocuments: DocumentGapItem[] = [];
    const missingDocuments: DocumentGapItem[] = [];
    const expiredDocuments: DocumentGapItem[] = [];
    const pendingVerificationDocuments: DocumentGapItem[] = [];
    const warnings: string[] = [];

    const now = new Date();

    for (const req of docRequirements) {
      // Find matching student documents for this required type
      const matchingDocs = studentDocuments.filter(
        (doc) => doc.document_type === req.docType && doc.status !== 'deleted'
      );

      if (matchingDocs.length === 0) {
        // MISSING: Student does not have this document
        missingDocuments.push({
          documentType: req.docType,
          title: req.title,
          description: req.description,
          isMandatory: req.isMandatory,
          status: 'missing',
          actionRequired: `Upload a valid ${DOCUMENT_TYPE_LABELS[req.docType]} to complete this requirement.`,
        });
        continue;
      }

      // Check the latest uploaded document of this type
      const latestDoc = matchingDocs[0];

      // Check if expired
      if (latestDoc.expiry_date) {
        const expDate = new Date(latestDoc.expiry_date);
        if (expDate < now) {
          expiredDocuments.push({
            documentType: req.docType,
            title: latestDoc.title || req.title,
            description: req.description,
            isMandatory: req.isMandatory,
            status: 'expired',
            documentId: latestDoc.id,
            fileName: latestDoc.file_path.split('/').pop(),
            expiryDate: latestDoc.expiry_date,
            actionRequired: `Your uploaded ${DOCUMENT_TYPE_LABELS[req.docType]} expired on ${latestDoc.expiry_date}. Please upload a renewed document.`,
          });
          continue;
        }
      }

      // Check if pending verification
      if (
        latestDoc.verification_status === 'pending_verification' ||
        latestDoc.verification_status === 'unverified'
      ) {
        pendingVerificationDocuments.push({
          documentType: req.docType,
          title: latestDoc.title || req.title,
          description: req.description,
          isMandatory: req.isMandatory,
          status: 'pending_verification',
          documentId: latestDoc.id,
          fileName: latestDoc.file_path.split('/').pop(),
          expiryDate: latestDoc.expiry_date,
          actionRequired: `Document is currently pending verification review.`,
        });
        continue;
      }

      // Document is verified and available
      availableDocuments.push({
        documentType: req.docType,
        title: latestDoc.title || req.title,
        description: req.description,
        isMandatory: req.isMandatory,
        status: 'available',
        documentId: latestDoc.id,
        fileName: latestDoc.file_path.split('/').pop(),
        expiryDate: latestDoc.expiry_date,
        actionRequired: 'Document is verified and ready for attachment.',
      });
    }

    // Compile all evaluated required items
    const requiredDocuments: DocumentGapItem[] = [
      ...availableDocuments,
      ...missingDocuments,
      ...expiredDocuments,
      ...pendingVerificationDocuments,
    ];

    // Compute mandatory counts
    const totalMandatory = requiredDocuments.filter((d) => d.isMandatory).length;
    const availableMandatory = availableDocuments.filter((d) => d.isMandatory).length;

    let completionPercentage = 100;
    if (requiredDocuments.length > 0) {
      completionPercentage = Math.round((availableDocuments.length / requiredDocuments.length) * 100);
    }

    // Determine readiness status deterministically
    let readinessStatus: DocumentReadinessStatus = 'READY';

    if (missingDocuments.some((d) => d.isMandatory) || expiredDocuments.some((d) => d.isMandatory)) {
      if (availableDocuments.length > 0) {
        readinessStatus = 'PARTIALLY_READY';
      } else {
        readinessStatus = 'MISSING_DOCUMENTS';
      }
      warnings.push(`Missing or expired mandatory documents prevent application submission.`);
    } else if (pendingVerificationDocuments.some((d) => d.isMandatory)) {
      readinessStatus = 'PARTIALLY_READY';
      warnings.push(`One or more mandatory documents are awaiting institutional verification.`);
    } else if (availableMandatory === totalMandatory) {
      readinessStatus = 'READY';
    }

    return {
      opportunityId,
      opportunityTitle: opportunity.title,
      requiredDocuments,
      availableDocuments,
      missingDocuments,
      expiredDocuments,
      pendingVerificationDocuments,
      readinessStatus,
      completionPercentage,
      warnings,
    };
  }

  /**
   * Deterministically extract document requirements from opportunity requirements and structure
   */
  private extractDocumentRequirements(
    opportunity: ServerOpportunity,
    requirements: StructuredRequirement[]
  ): { docType: CanonicalDocumentType; title: string; description: string; isMandatory: boolean }[] {
    const list: { docType: CanonicalDocumentType; title: string; description: string; isMandatory: boolean }[] = [];
    const seen = new Set<string>();

    for (const req of requirements) {
      const typeStr = (req.requirement_type || '').toLowerCase();
      const cJson = (req.criteria_json || {}) as Record<string, any>;
      const isMandatory = req.is_mandatory !== false;


      let canonicalType: CanonicalDocumentType | null = null;
      let title = DOCUMENT_TYPE_LABELS.other;
      let description = cJson.description || 'Required application document';

      if (typeStr === 'document' || typeStr === 'certificate') {
        const fieldOrDoc = (cJson.document_type || cJson.field || cJson.documentType || '').toLowerCase();
        canonicalType = this.resolveDocumentType(fieldOrDoc);
        title = DOCUMENT_TYPE_LABELS[canonicalType] || cJson.title || 'Required Document';
      } else if (typeStr === 'resume' || typeStr === 'cv') {
        canonicalType = 'resume';
        title = DOCUMENT_TYPE_LABELS.resume;
      } else if (typeStr === 'transcript' || typeStr === 'marksheet') {
        canonicalType = 'transcript';
        title = DOCUMENT_TYPE_LABELS.transcript;
      } else if (typeStr === 'id_proof' || typeStr === 'identity') {
        canonicalType = 'identity';
        title = DOCUMENT_TYPE_LABELS.identity;
      } else if (typeStr === 'income_certificate' || typeStr === 'income') {
        canonicalType = 'income_certificate';
        title = DOCUMENT_TYPE_LABELS.income_certificate;
      } else if (typeStr === 'community_certificate' || typeStr === 'caste') {
        canonicalType = 'community_certificate';
        title = DOCUMENT_TYPE_LABELS.community_certificate;
      } else if (typeStr === 'bonafide_certificate' || typeStr === 'bonafide') {
        canonicalType = 'bonafide_certificate';
        title = DOCUMENT_TYPE_LABELS.bonafide_certificate;
      } else if (typeStr === 'recommendation' || typeStr === 'lor') {
        canonicalType = 'recommendation';
        title = DOCUMENT_TYPE_LABELS.recommendation;
      } else if (typeStr === 'portfolio') {
        canonicalType = 'portfolio';
        title = DOCUMENT_TYPE_LABELS.portfolio;
      }

      if (canonicalType && !seen.has(canonicalType)) {
        seen.add(canonicalType);
        list.push({
          docType: canonicalType,
          title,
          description,
          isMandatory,
        });
      }
    }

    // Default category-based standard requirements if no explicit requirements found
    // Scholarships often require transcript and resume by default; internships require resume
    if (list.length === 0) {
      if (opportunity.category === 'internship') {
        list.push({
          docType: 'resume',
          title: DOCUMENT_TYPE_LABELS.resume,
          description: 'Current technical resume or curriculum vitae for review',
          isMandatory: true,
        });
      } else if (opportunity.category === 'scholarship') {
        list.push({
          docType: 'resume',
          title: DOCUMENT_TYPE_LABELS.resume,
          description: 'Academic CV highlighting achievements and coursework',
          isMandatory: true,
        });
        list.push({
          docType: 'transcript',
          title: DOCUMENT_TYPE_LABELS.transcript,
          description: 'Official college or school marksheet / academic transcript',
          isMandatory: true,
        });
      }
    }

    return list;
  }

  private resolveDocumentType(text: string): CanonicalDocumentType {
    const s = text.toLowerCase();
    if (s.includes('resume') || s.includes('cv')) return 'resume';
    if (s.includes('income')) return 'income_certificate';
    if (s.includes('community') || s.includes('caste')) return 'community_certificate';
    if (s.includes('bonafide')) return 'bonafide_certificate';
    if (s.includes('transcript') || s.includes('marksheet') || s.includes('grade')) return 'transcript';
    if (s.includes('degree') || s.includes('provisional')) return 'degree_certificate';
    if (s.includes('aadhaar') || s.includes('identity') || s.includes('id proof')) return 'identity';
    if (s.includes('college id') || s.includes('student id')) return 'college_id';
    if (s.includes('passport')) return 'passport';
    if (s.includes('bank') || s.includes('passbook')) return 'bank_document';
    if (s.includes('recommendation') || s.includes('lor')) return 'recommendation';
    if (s.includes('portfolio') || s.includes('project')) return 'portfolio';
    return 'other';
  }
}

export const documentGapService = new DocumentGapService();
