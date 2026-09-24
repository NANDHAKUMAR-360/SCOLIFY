import { opportunityRepository } from '../repositories/opportunityRepository.js';
import { savedOpportunitiesRepository } from '../repositories/savedOpportunitiesRepository.js';
import { normalizeOpportunityData } from '../utils/opportunityNormalizer.js';
import { detectDuplicateStatus } from '../utils/duplicateDetector.js';
import { calculateExpiryStatus } from '../utils/expiryEngine.js';
import {
  ServerOpportunity,
  OpportunityFilterQuery,
  VerificationStatus,
  LifecycleStatus,
} from '../types/opportunity.js';

export class OpportunityService {
  async getOpportunities(filter: OpportunityFilterQuery): Promise<{ items: ServerOpportunity[]; total: number }> {
    const { items, total } = await opportunityRepository.queryOpportunities(filter);

    // Attach student saved state & calculate live expiry engine status
    let savedIds: string[] = [];
    if (filter.studentId) {
      savedIds = await savedOpportunitiesRepository.listSavedByStudent(filter.studentId);
    }

    const processedItems = items.map((opp) => {
      const expiry = calculateExpiryStatus(opp.application_deadline);
      return {
        ...opp,
        expiry_status: expiry.status,
        is_saved: savedIds.includes(opp.id),
      };
    });

    return { items: processedItems, total };
  }

  async getOpportunityById(id: string, studentId?: string): Promise<ServerOpportunity | null> {
    const opp = await opportunityRepository.findById(id);
    if (!opp) {
      return null;
    }

    const expiry = calculateExpiryStatus(opp.application_deadline);
    let isSaved = false;
    if (studentId) {
      const savedIds = await savedOpportunitiesRepository.listSavedByStudent(studentId);
      isSaved = savedIds.includes(opp.id);
    }

    return {
      ...opp,
      expiry_status: expiry.status,
      is_saved: isSaved,
    };
  }

  async normalizeAndValidateRawData(rawData: any): Promise<{
    normalized: Partial<ServerOpportunity>;
    duplicateResult: { status: string; matchedOpportunityId?: string };
    expiryResult: { status: string; isExpired: boolean };
  }> {
    const normalized = normalizeOpportunityData(rawData);
    const { items: existing } = await opportunityRepository.queryOpportunities({});
    const duplicateResult = detectDuplicateStatus(normalized as any, existing);
    const expiryResult = calculateExpiryStatus(normalized.application_deadline);

    return {
      normalized,
      duplicateResult,
      expiryResult,
    };
  }

  async adminVerifyOpportunity(
    id: string,
    verificationStatus: VerificationStatus,
    reasoning: string,
    adminUserId: string
  ): Promise<ServerOpportunity> {
    const lifecycle: LifecycleStatus = verificationStatus === 'verified' ? 'verified' : 'admin_review';
    return await opportunityRepository.updateVerification(id, verificationStatus, reasoning, adminUserId, lifecycle);
  }

  async saveOpportunity(studentId: string, opportunityId: string) {
    return await savedOpportunitiesRepository.saveOpportunity(studentId, opportunityId);
  }

  async unsaveOpportunity(studentId: string, opportunityId: string) {
    return await savedOpportunitiesRepository.unsaveOpportunity(studentId, opportunityId);
  }
}

export const opportunityService = new OpportunityService();
