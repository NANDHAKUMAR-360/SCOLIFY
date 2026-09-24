import { ApplicationReadinessResult, ReadinessChecklistItem } from '../../types/readiness.js';
import { ServerOpportunity, StructuredRequirement } from '../../types/opportunity.js';
import { FullCanonicalProfile } from '../../types/profile.js';
import { DocumentRecord } from '../../types/document.js';
import { eligibilityEngine } from '../eligibility/eligibilityEngine.js';
import { matchEngineService } from '../matching/matchEngine.js';
import { documentGapService } from './documentGapService.js';

export class ApplicationReadinessService {
  /**
   * Deterministically evaluate complete application readiness across 5 dimensions:
   * 1. Profile Readiness
   * 2. Eligibility Hard Gate
   * 3. Match Compatibility
   * 4. Document Intelligence Gaps
   * 5. Deadline Feasibility
   *
   * GROQ DOES NOT DECIDE READINESS.
   */
  async evaluateReadiness(
    student: FullCanonicalProfile,
    opportunity: ServerOpportunity,
    studentDocuments: DocumentRecord[]
  ): Promise<ApplicationReadinessResult> {
    const blockers: string[] = [];
    const warnings: string[] = [];
    const checklist: ReadinessChecklistItem[] = [];

    // 1. Profile Readiness Check
    const completionPct = student.completion?.percentage ?? student.student?.completion_percentage ?? 0;
    const hasEducation = (student.education || []).length > 0;
    const hasSkills = (student.skills || []).length > 0;
    const profileReady = Boolean(completionPct >= 50 || (hasEducation && hasSkills));

    if (!profileReady) {
      blockers.push('Incomplete student profile: Please complete your education and skills.');
    }

    checklist.push({
      key: 'profile',
      label: 'Student Profile',
      isReady: profileReady,
      statusText: profileReady ? 'Profile Complete' : 'Profile Incomplete',
      details: profileReady
        ? `Academic background and skills verified (${student.skills?.length || 0} skills listed).`
        : 'Ensure your education and at least one skill are recorded in your profile.',
      actionUrl: '/profile',
      isBlocking: true,
    });

    // 2. Deterministic Eligibility Hard Gate
    const reqs: StructuredRequirement[] =
      opportunity.requirements || (opportunity as any).opportunity_requirements || [];

    const eligibilityResult = eligibilityEngine.evaluateOpportunityEligibility(
      student,
      opportunity,
      reqs
    );
    const eligibilityReady = eligibilityResult.status === 'ELIGIBLE';

    if (eligibilityResult.status === 'INELIGIBLE') {
      blockers.push('Ineligible: You do not satisfy the mandatory criteria for this opportunity.');
    } else if (eligibilityResult.status === 'MORE_INFO') {
      blockers.push('Additional information needed to evaluate eligibility criteria.');
    }

    checklist.push({
      key: 'eligibility',
      label: 'Eligibility Criteria',
      isReady: eligibilityReady,
      statusText:
        eligibilityResult.status === 'ELIGIBLE'
          ? 'Eligible'
          : eligibilityResult.status === 'INELIGIBLE'
          ? 'Ineligible'
          : 'More Info Needed',
      details: eligibilityResult.summary || eligibilityResult.requirements?.[0]?.reason || 'Eligibility evaluated',
      isBlocking: true,
    });

    // 3. Match Compatibility Check
    let matchScore = 0;
    if (eligibilityReady) {
      const matchResult = matchEngineService.computeEligibleMatch(
        student.student?.id || '',
        student,
        opportunity,
        eligibilityResult
      );
      matchScore = matchResult.score || 0;
    }

    const matchReady = eligibilityReady && matchScore >= 30;

    if (eligibilityReady && matchScore < 30) {
      warnings.push(`Low compatibility score (${matchScore}%): consider tailoring skills before applying.`);
    }

    checklist.push({
      key: 'match',
      label: 'Compatibility Match',
      isReady: matchReady,
      statusText: `${matchScore}% Match`,
      details: `Calculated compatibility score based on academic level, skills, and preferences.`,
      isBlocking: false,
    });

    // 4. Document Intelligence Gap Analysis
    const documentGap = documentGapService.analyzeDocumentGap(opportunity, studentDocuments);
    const mandatoryMissing = documentGap.missingDocuments.filter((d) => d.isMandatory);
    const mandatoryExpired = documentGap.expiredDocuments.filter((d) => d.isMandatory);
    const documentsReady = mandatoryMissing.length === 0 && mandatoryExpired.length === 0;

    if (mandatoryMissing.length > 0) {
      const names = mandatoryMissing.map((d) => d.title).join(', ');
      blockers.push(`Missing mandatory documents: ${names}`);
    }
    if (mandatoryExpired.length > 0) {
      const names = mandatoryExpired.map((d) => d.title).join(', ');
      blockers.push(`Expired mandatory documents: ${names}`);
    }

    checklist.push({
      key: 'documents',
      label: 'Required Documents',
      isReady: documentsReady,
      statusText: documentsReady
        ? `${documentGap.availableDocuments.length}/${documentGap.requiredDocuments.length} Ready`
        : `${mandatoryMissing.length + mandatoryExpired.length} Action Needed`,
      details: documentsReady
        ? 'All mandatory documents are present and valid in your vault.'
        : `Missing or expired documents require upload in Document Vault before submitting.`,
      actionUrl: '/documents',
      isBlocking: true,
    });

    // 5. Deadline Readiness Check
    let deadlineReady = true;
    if (opportunity.application_deadline) {
      const deadline = new Date(opportunity.application_deadline);
      const now = new Date();
      if (deadline < now) {
        deadlineReady = false;
        blockers.push('Application deadline has passed.');
      } else {
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 3) {
          warnings.push(`Deadline is very close: only ${daysLeft} days remaining.`);
        }
      }
    }

    checklist.push({
      key: 'deadline',
      label: 'Application Deadline',
      isReady: deadlineReady,
      statusText: deadlineReady ? 'Open' : 'Expired',
      details: opportunity.application_deadline
        ? `Deadline: ${new Date(opportunity.application_deadline).toLocaleDateString()}`
        : 'Rolling deadline / No explicit cutoff specified.',
      isBlocking: true,
    });

    // Overall Deterministic Evaluation
    const overallReady =
      profileReady && eligibilityReady && matchReady && documentsReady && deadlineReady;

    let overallStatus: 'READY' | 'PARTIALLY_READY' | 'BLOCKED' | 'EXPIRED' = 'PARTIALLY_READY';
    if (!deadlineReady) {
      overallStatus = 'EXPIRED';
    } else if (!eligibilityReady) {
      overallStatus = 'BLOCKED';
    } else if (overallReady) {
      overallStatus = 'READY';
    } else {
      overallStatus = 'PARTIALLY_READY';
    }

    return {
      opportunityId: opportunity.id,
      opportunityTitle: opportunity.title,
      profileReady,
      eligibilityReady,
      matchReady,
      documentsReady,
      deadlineReady,
      overallReady,
      overallStatus,
      eligibilityStatus: eligibilityResult.status,
      matchScore,
      blockers,
      warnings,
      checklist,
      documentGap,
      calculatedAt: new Date().toISOString(),
    };
  }
}

export const applicationReadinessService = new ApplicationReadinessService();
