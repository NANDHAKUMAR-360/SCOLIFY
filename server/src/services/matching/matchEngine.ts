// Match Engine Service – Phase C
// Core Deterministic Match & Compatibility Engine

import { MATCH_WEIGHTS, MATCH_SCORE_VERSION, normalizeSkill } from '../../config/matchConfig.js';
import { eligibilityService } from '../eligibility/eligibilityService.js';
import { profileService } from '../profileService.js';
import { opportunityService } from '../opportunityService.js';
import { matchResultsRepository } from '../../repositories/matchResultsRepository.js';
import { matchingExplanationService } from './matchingExplanationService.js';
import { MatchResultInsert, MatchResultRecord } from '../../types/matchResult.js';
import { FullCanonicalProfile } from '../../types/profile.js';
import { ServerOpportunity, StructuredRequirement } from '../../types/opportunity.js';
import { EligibilityResult } from '../../types/eligibility.js';

export class MatchEngineService {
  /**
   * Orchestrates the full match pipeline for a given student and opportunity.
   * Gated strictly by deterministic eligibility (Part 05 engine).
   * Persists and returns the authoritative MatchResultRecord.
   */
  async runMatch(studentId: string, opportunityId: string, userId?: string): Promise<MatchResultRecord> {
    // 1. Resolve canonical student profile
    const targetUserId = userId || studentId;
    const profile: FullCanonicalProfile = await profileService.getCanonicalProfile(targetUserId);
    const resolvedStudentId = profile.student?.id || studentId;

    // 2. Load Opportunity and verify trust boundaries
    const opportunity: ServerOpportunity | null = await opportunityService.getOpportunityById(
      opportunityId,
      resolvedStudentId
    );
    if (!opportunity) {
      throw new Error(`Opportunity '${opportunityId}' not found.`);
    }

    const isVerified = opportunity.verification_status === 'verified';
    const isPublished =
      opportunity.lifecycle_status === 'published' ||
      opportunity.lifecycle_status === undefined ||
      opportunity.lifecycle_status === null;
    const isActive = opportunity.is_active !== false;
    const isNotExpired = opportunity.expiry_status !== 'expired';

    if (!isVerified || !isPublished || !isActive || !isNotExpired) {
      throw new Error(
        `Match unavailable: Opportunity must be verified, published, active, and not expired (status: ${opportunity.verification_status}, lifecycle: ${opportunity.lifecycle_status}, expiry: ${opportunity.expiry_status}).`
      );
    }

    // 3. Deterministic Eligibility Hard Gate (Reusing Part 05 engine)
    const eligibilityResult: EligibilityResult = await eligibilityService.evaluateStudentEligibility(
      targetUserId,
      opportunityId,
      false
    );

    let matchInsert: MatchResultInsert;

    // 4. Strict Branching Based on Eligibility Gate
    if (eligibilityResult.status === 'INELIGIBLE') {
      matchInsert = this.assembleIneligibleResult(resolvedStudentId, opportunity, eligibilityResult);
    } else if (eligibilityResult.status === 'MORE_INFO') {
      matchInsert = this.assembleMoreInfoResult(resolvedStudentId, opportunity, eligibilityResult);
    } else {
      // Status is 'ELIGIBLE' -> Proceed to deterministic match calculation
      matchInsert = this.computeEligibleMatch(resolvedStudentId, profile, opportunity, eligibilityResult);

      // Groq AI Explanation Layer (Server-side, failsafe)
      try {
        const aiText = await matchingExplanationService.generateMatchExplanation({
          profile,
          opportunity,
          eligibility: eligibilityResult,
          score: matchInsert.score,
          factorScores: matchInsert.factor_scores,
          matchedSkills: matchInsert.matched_skills || [],
          missingSkills: matchInsert.missing_skills || [],
          strengths: matchInsert.strengths || [],
          gaps: matchInsert.gaps || [],
        });
        matchInsert.ai_explanation = aiText ?? null;
      } catch {
        matchInsert.ai_explanation = null;
      }
    }

    // 5. Persist result with UPSERT semantics (Prevent duplicate collisions on repeated requests)
    return await matchResultsRepository.upsertMatchResult(matchInsert);
  }

  /**
   * Assembles the persisted match payload when the student is INELIGIBLE.
   * Gated: No recommendation score calculated.
   */
  private assembleIneligibleResult(
    studentId: string,
    opportunity: ServerOpportunity,
    eligibility: EligibilityResult
  ): MatchResultInsert {
    const failedReqs = eligibility.requirements.filter((r) => r.status === 'FAIL');
    const gaps = failedReqs.map((r) => r.reason || r.description || 'Mandatory requirement not met');
    const warnings = ['Student does not satisfy mandatory eligibility criteria for this opportunity.'];

    const explanation = {
      summary: eligibility.summary,
      eligibilityStatus: 'INELIGIBLE',
      reasons: failedReqs.map((r) => ({
        description: r.description,
        reason: r.reason || 'Requirement criteria not satisfied',
        sourceField: r.sourceField,
      })),
      strengths: [],
      gaps,
      matchedCriteria: {},
      deadlineNote: opportunity.application_deadline
        ? `Application deadline: ${opportunity.application_deadline}`
        : 'No deadline specified',
      warnings,
      nextSteps: 'Review the mandatory eligibility requirements and consider opportunities matching your current qualifications.',
    };

    return {
      student_id: studentId,
      opportunity_id: opportunity.id,
      eligibility_status: 'INELIGIBLE',
      score: 0,
      score_version: MATCH_SCORE_VERSION,
      factor_scores: {
        skillMatch: 0,
        educationMatch: 0,
        interestMatch: 0,
        preferenceMatch: 0,
        locationRemote: 0,
        deadlineFeasibility: 0,
        experienceMatch: 0,
      },
      matched_skills: [],
      missing_skills: [],
      matched_criteria: {},
      strengths: [],
      gaps,
      warnings,
      explanation,
      ai_explanation: null,
      is_stale: false,
    };
  }

  /**
   * Assembles the persisted match payload when student profile is missing critical data (MORE_INFO).
   * Gated: No recommendation score calculated.
   */
  private assembleMoreInfoResult(
    studentId: string,
    opportunity: ServerOpportunity,
    eligibility: EligibilityResult
  ): MatchResultInsert {
    const missingReqs = eligibility.requirements.filter((r) => r.status === 'MORE_INFO');
    const gaps = missingReqs.map((r) => r.reason || r.description || 'Missing profile information');
    const warnings = ['Incomplete profile information prevents accurate eligibility evaluation.'];

    const explanation = {
      summary: eligibility.summary,
      eligibilityStatus: 'MORE_INFO',
      missingFields: missingReqs.map((r) => ({
        description: r.description,
        reason: r.reason,
        sourceField: r.sourceField,
      })),
      strengths: [],
      gaps,
      matchedCriteria: {},
      deadlineNote: opportunity.application_deadline
        ? `Application deadline: ${opportunity.application_deadline}`
        : 'No deadline specified',
      warnings,
      nextSteps: 'Update missing fields in your academic profile to enable full compatibility and eligibility evaluation.',
    };

    return {
      student_id: studentId,
      opportunity_id: opportunity.id,
      eligibility_status: 'MORE_INFO',
      score: 0,
      score_version: MATCH_SCORE_VERSION,
      factor_scores: {
        skillMatch: 0,
        educationMatch: 0,
        interestMatch: 0,
        preferenceMatch: 0,
        locationRemote: 0,
        deadlineFeasibility: 0,
        experienceMatch: 0,
      },
      matched_skills: [],
      missing_skills: [],
      matched_criteria: {},
      strengths: [],
      gaps,
      warnings,
      explanation,
      ai_explanation: null,
      is_stale: false,
    };
  }

  /**
   * Computes deterministic factor scores for an ELIGIBLE student.
   * Produces structured explanation and score weights.
   */
  public computeEligibleMatch(
    studentId: string,
    profile: FullCanonicalProfile,
    opportunity: ServerOpportunity,
    eligibility: EligibilityResult
  ): MatchResultInsert {
    const factorScores: Record<string, number> = {};
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    const matchedCriteria: Record<string, any> = {};
    const strengths: string[] = [];
    const gaps: string[] = [];
    const warnings: string[] = [];

    const reqs: StructuredRequirement[] = opportunity.requirements || [];

    // 1. Skill Match (Weight: 30)
    const skillReqs = reqs.filter((r) => r.requirement_type === 'skill');
    if (skillReqs.length > 0) {
      const studentSkillSet = new Set(
        (profile.skills || []).map((s) => normalizeSkill(s.skill_name))
      );
      for (const req of skillReqs) {
        const requiredSkillName = req.criteria_json?.value?.toString() || '';
        const normalizedRequired = normalizeSkill(requiredSkillName);
        if (studentSkillSet.has(normalizedRequired)) {
          matchedSkills.push(requiredSkillName);
        } else {
          missingSkills.push(requiredSkillName);
        }
      }
      const skillRatio = matchedSkills.length / skillReqs.length;
      factorScores.skillMatch = Math.round(skillRatio * MATCH_WEIGHTS.skillMatch);
      matchedCriteria.skills = { matched: matchedSkills, missing: missingSkills, total: skillReqs.length };

      if (matchedSkills.length > 0) {
        strengths.push(`Matches ${matchedSkills.length} of ${skillReqs.length} required skill(s) (${matchedSkills.join(', ')})`);
      }
      if (missingSkills.length > 0) {
        gaps.push(`Missing ${missingSkills.length} recommended skill(s): ${missingSkills.join(', ')}`);
      }
    } else {
      // No explicit skill requirement -> award full weight
      factorScores.skillMatch = MATCH_WEIGHTS.skillMatch;
      strengths.push('Opportunity has no restrictive skill barriers');
    }

    // 2. Education Match (Weight: 20)
    const degreeReqs = reqs.filter((r) => r.requirement_type === 'degree');
    const gpaReqs = reqs.filter((r) => r.requirement_type === 'gpa');

    let educationPassed = true;
    if (degreeReqs.length > 0) {
      const requiredVal = degreeReqs[0].criteria_json?.value?.toString().toLowerCase() || '';
      const hasDegree = (profile.education || []).some((e) =>
        e.degree?.toLowerCase().includes(requiredVal) || e.field_of_study?.toLowerCase().includes(requiredVal)
      );
      if (!hasDegree) educationPassed = false;
    }
    if (gpaReqs.length > 0) {
      const minGpa = Number(gpaReqs[0].criteria_json?.value) || 0;
      const studentGpa = profile.education?.[0]?.gpa || 0;
      if (studentGpa < minGpa) educationPassed = false;
    }

    if (educationPassed) {
      factorScores.educationMatch = MATCH_WEIGHTS.educationMatch;
      strengths.push('Academic qualifications and GPA align with criteria');
    } else {
      factorScores.educationMatch = Math.round(MATCH_WEIGHTS.educationMatch / 2);
      gaps.push('Academic degree or GPA requires review against recommendations');
    }

    // 3. Interest Match (Weight: 15)
    const category = (opportunity.category || '').toLowerCase();
    const title = (opportunity.title || '').toLowerCase();
    const description = (opportunity.description || '').toLowerCase();
    const studentInterests = (profile.interests || []).map((i) => (i.interest_tag || '').toLowerCase());

    const hasInterestMatch = studentInterests.some(
      (tag) => category.includes(tag) || title.includes(tag) || description.includes(tag) || tag.includes(category)
    );
    if (hasInterestMatch) {
      factorScores.interestMatch = MATCH_WEIGHTS.interestMatch;
      strengths.push(`Aligns directly with your domain interests (${opportunity.category})`);
    } else {
      factorScores.interestMatch = 0;
      gaps.push(`Category '${opportunity.category}' is outside your listed interest tags`);
    }

    // 4. Preference Match (Weight: 10)
    const studentPreferences = (profile.student?.preferred_categories || []).map((p) => p.toLowerCase());
    if (studentPreferences.includes(category)) {
      factorScores.preferenceMatch = MATCH_WEIGHTS.preferenceMatch;
      strengths.push(`Matches your stated opportunity preference for ${opportunity.category}`);
    } else {
      factorScores.preferenceMatch = 0;
    }

    // 5. Location / Remote (Weight: 10)
    if (opportunity.is_remote) {
      factorScores.locationRemote = MATCH_WEIGHTS.locationRemote;
      strengths.push('Fully remote eligibility - accessible from anywhere');
    } else if (
      profile.student?.country &&
      opportunity.location &&
      opportunity.location.toLowerCase().includes(profile.student.country.toLowerCase())
    ) {
      factorScores.locationRemote = MATCH_WEIGHTS.locationRemote;
      strengths.push(`Location matches your home country (${profile.student.country})`);
    } else {
      factorScores.locationRemote = Math.round(MATCH_WEIGHTS.locationRemote / 2);
      warnings.push(`Location is on-site (${opportunity.location || 'Specific location'})`);
    }

    // 6. Deadline Feasibility (Weight: 10)
    const now = new Date();
    if (opportunity.application_deadline) {
      const deadline = new Date(opportunity.application_deadline);
      const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 7) {
        factorScores.deadlineFeasibility = MATCH_WEIGHTS.deadlineFeasibility;
        strengths.push(`Ample application window (${diffDays} days remaining)`);
      } else if (diffDays > 0) {
        factorScores.deadlineFeasibility = Math.round(MATCH_WEIGHTS.deadlineFeasibility / 2);
        warnings.push(`Approaching deadline (${diffDays} days remaining)`);
      } else {
        factorScores.deadlineFeasibility = 0;
        warnings.push('Application deadline has passed');
      }
    } else {
      factorScores.deadlineFeasibility = MATCH_WEIGHTS.deadlineFeasibility;
      strengths.push('Rolling deadline / open application window');
    }

    // 7. Experience Match (Weight: 5)
    const expReqs = reqs.filter((r) => r.requirement_type === 'experience');
    if (expReqs.length > 0) {
      factorScores.experienceMatch = MATCH_WEIGHTS.experienceMatch;
    } else {
      factorScores.experienceMatch = MATCH_WEIGHTS.experienceMatch;
      strengths.push('No prior commercial experience required');
    }

    // Total Score calculation (Sum of factor scores, clamped 0 - 100)
    const rawTotal = Object.values(factorScores).reduce((a, b) => a + b, 0);
    const totalScore = Math.max(0, Math.min(100, Math.round(rawTotal)));

    const explanation = {
      summary: `Your profile demonstrates an overall deterministic compatibility score of ${totalScore}% with ${opportunity.title}.`,
      strengths,
      gaps,
      matchedCriteria,
      deadlineNote: opportunity.application_deadline
        ? `Application deadline: ${opportunity.application_deadline}`
        : 'Open application window',
      warnings,
      nextSteps:
        totalScore >= 70
          ? 'Strong compatibility: We recommend completing your application before the deadline.'
          : 'Moderate compatibility: Review the identified skill gaps before proceeding.',
    };

    return {
      student_id: studentId,
      opportunity_id: opportunity.id,
      eligibility_status: 'ELIGIBLE',
      score: totalScore,
      score_version: MATCH_SCORE_VERSION,
      factor_scores: factorScores,
      matched_skills: matchedSkills,
      missing_skills: missingSkills,
      matched_criteria: matchedCriteria,
      strengths,
      gaps,
      warnings,
      explanation,
      ai_explanation: null,
      is_stale: false,
    };
  }

  // Backwards compatibility alias for computeMatch
  public computeMatch(
    profile: FullCanonicalProfile,
    opportunity: ServerOpportunity,
    eligibility: EligibilityResult
  ): MatchResultInsert {
    if (eligibility.status === 'INELIGIBLE') {
      return this.assembleIneligibleResult(profile.student.id, opportunity, eligibility);
    }
    if (eligibility.status === 'MORE_INFO') {
      return this.assembleMoreInfoResult(profile.student.id, opportunity, eligibility);
    }
    return this.computeEligibleMatch(profile.student.id, profile, opportunity, eligibility);
  }
}

export const matchEngineService = new MatchEngineService();
