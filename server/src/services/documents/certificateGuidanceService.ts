import {
  CertificateGuidanceItem,
  CertificateGuidanceResult,
  DocumentRecord,
} from '../../types/document.js';
import { ServerOpportunity } from '../../types/opportunity.js';
import { documentGapService } from './documentGapService.js';

export class CertificateGuidanceService {
  /**
   * Deterministically produces actionable guidance for all certificate and document requirements.
   * NEVER invents issuing authority details or fake URLs.
   */
  generateGuidance(
    opportunity: ServerOpportunity,
    studentDocuments: DocumentRecord[]
  ): CertificateGuidanceResult {
    const gapAnalysis = documentGapService.analyzeDocumentGap(opportunity, studentDocuments);
    const guidanceItems: CertificateGuidanceItem[] = [];

    // Derive official source URL if available from opportunity data
    const officialPortalUrl =
      opportunity.official_url && opportunity.official_url.startsWith('http')
        ? opportunity.official_url
        : undefined;

    for (const item of gapAnalysis.requiredDocuments) {
      let whatToDoNext = '';
      const studentHasIt = item.status === 'available';

      switch (item.status) {
        case 'available':
          whatToDoNext = `Document is verified and ready. It will be attached to your application draft upon your confirmation.`;
          break;
        case 'missing':
          whatToDoNext = `Obtain your official ${item.title} and upload a clean copy to your Scolify Document Vault.`;
          break;
        case 'expired':
          whatToDoNext = `Your uploaded ${item.title} expired on ${item.expiryDate}. Please obtain a renewed certificate and upload it.`;
          break;
        case 'pending_verification':
          whatToDoNext = `Your document is undergoing verification. Wait for confirmation or verify with institutional authority.`;
          break;
      }

      guidanceItems.push({
        documentType: item.documentType,
        title: item.title,
        whyRequired: item.description,
        isRequired: item.isMandatory,
        studentHasIt,
        status: item.status,
        expiryDate: item.expiryDate || null,
        officialPortalUrl,
        whatToDoNext,
      });
    }

    const notes: string[] = [];
    if (guidanceItems.length === 0) {
      notes.push('This opportunity does not require any specific certificates or uploaded documents.');
    } else {
      notes.push('All document attachments require your review and explicit approval before application submission.');
    }

    return {
      opportunityId: opportunity.id,
      guidanceItems,
      notes,
    };
  }
}

export const certificateGuidanceService = new CertificateGuidanceService();
