import { profileRepository } from '../repositories/profileRepository.js';
import { educationRepository } from '../repositories/educationRepository.js';
import { skillsRepository } from '../repositories/skillsRepository.js';
import { interestsRepository } from '../repositories/interestsRepository.js';
import { FullCanonicalProfile, ProfileRecord, StudentRecord } from '../types/profile.js';
import { logger } from '../utils/logger.js';

export interface ProfileCompletionResult {
  percentage: number;
  completedSections: string[];
  incompleteSections: string[];
  nextAction: string;
}

export class ProfileService {
  calculateCompletion(
    profile: ProfileRecord,
    student: StudentRecord,
    educationCount: number,
    skillsCount: number,
    interestsCount: number
  ): ProfileCompletionResult {
    let score = 0;
    const completed: string[] = [];
    const incomplete: string[] = [];

    // 1. Basic Information (25%)
    const hasBasicInfo = !!(profile.full_name && (student.headline || student.bio) && student.country);
    if (hasBasicInfo) {
      score += 25;
      completed.push('Basic Information');
    } else {
      incomplete.push('Basic Information');
    }

    // 2. Education (25%)
    if (educationCount > 0) {
      score += 25;
      completed.push('Academic Education');
    } else {
      incomplete.push('Academic Education');
    }

    // 3. Skills (20%)
    if (skillsCount >= 2) {
      score += 20;
      completed.push('Skills Profile');
    } else if (skillsCount === 1) {
      score += 10;
      incomplete.push('Skills Profile (Add 1 more skill)');
    } else {
      incomplete.push('Skills Profile');
    }

    // 4. Interests (15%)
    if (interestsCount >= 2) {
      score += 15;
      completed.push('Domain Interests');
    } else if (interestsCount === 1) {
      score += 7;
      incomplete.push('Domain Interests (Add 1 more tag)');
    } else {
      incomplete.push('Domain Interests');
    }

    // 5. Opportunity Preferences (15%)
    if (student.preferred_categories && student.preferred_categories.length > 0) {
      score += 15;
      completed.push('Opportunity Preferences');
    } else {
      incomplete.push('Opportunity Preferences');
    }

    const percentage = Math.min(100, Math.round(score));

    let nextAction = 'Profile 100% Complete!';
    if (incomplete.length > 0) {
      nextAction = `Complete your ${incomplete[0]} to boost opportunity match accuracy.`;
    }

    return {
      percentage,
      completedSections: completed,
      incompleteSections: incomplete,
      nextAction,
    };
  }

  async getCanonicalProfile(userId: string, email?: string, fullName?: string): Promise<FullCanonicalProfile> {
    // Idempotent initialization
    const { profile, student } = await profileRepository.ensureProfileExists(userId, email || '', fullName || '');

    const [education, skills, interests] = await Promise.all([
      educationRepository.listByStudentId(student.id),
      skillsRepository.listByStudentId(student.id),
      interestsRepository.listByStudentId(student.id),
    ]);

    const completion = this.calculateCompletion(
      profile,
      student,
      education.length,
      skills.length,
      interests.length
    );

    // Sync database completion percentage if updated
    if (student.completion_percentage !== completion.percentage) {
      await profileRepository.updateStudentInfo(student.id, {
        completion_percentage: completion.percentage,
      });
      student.completion_percentage = completion.percentage;
    }

    return {
      profile,
      student,
      education,
      skills,
      interests,
      completion,
    };
  }
}

export const profileService = new ProfileService();
