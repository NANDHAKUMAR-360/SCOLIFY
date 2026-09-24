import { Request, Response } from 'express';
import { profileService } from '../services/profileService.js';
import { profileRepository } from '../repositories/profileRepository.js';
import { educationRepository } from '../repositories/educationRepository.js';
import { skillsRepository } from '../repositories/skillsRepository.js';
import { interestsRepository } from '../repositories/interestsRepository.js';
import { updateProfileSchema, createEducationSchema, createSkillSchema, createInterestSchema } from '../validators/profileValidator.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const email = req.user!.email;
    const fullName = req.user!.user_metadata?.full_name;

    const canonicalProfile = await profileService.getCanonicalProfile(userId, email, fullName);
    return sendSuccess(res, canonicalProfile, 'Canonical student profile retrieved successfully');
  } catch (error: any) {
    return sendError(res, 'PROFILE_FETCH_ERROR', error.message || 'Failed to retrieve student profile', 500);
  }
};

export const initializeProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const email = req.user!.email;
    const fullName = req.user!.user_metadata?.full_name;

    const canonicalProfile = await profileService.getCanonicalProfile(userId, email, fullName);
    return sendSuccess(res, canonicalProfile, 'Profile initialized');
  } catch (error: any) {
    return sendError(res, 'PROFILE_INIT_ERROR', error.message || 'Failed to initialize profile', 500);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid profile update parameters', 400, parseResult.error.format());
    }

    const data = parseResult.data;
    const existing = await profileRepository.ensureProfileExists(userId, req.user!.email || '', '');

    // 1. Update Profile table fields if provided
    if (data.fullName || data.phoneNumber || data.avatarUrl) {
      await profileRepository.updateProfileInfo(userId, {
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        avatar_url: data.avatarUrl,
      });
    }

    // 2. Update Student table fields if provided
    if (
      data.headline !== undefined ||
      data.bio !== undefined ||
      data.dateOfBirth !== undefined ||
      data.country !== undefined ||
      data.state !== undefined ||
      data.city !== undefined ||
      data.preferredCategories !== undefined
    ) {
      await profileRepository.updateStudentInfo(existing.student.id, {
        headline: data.headline,
        bio: data.bio,
        date_of_birth: data.dateOfBirth,
        country: data.country,
        state: data.state,
        city: data.city,
        preferred_categories: data.preferredCategories as any,
      });
    }

    const updatedProfile = await profileService.getCanonicalProfile(userId, req.user!.email, data.fullName);
    return sendSuccess(res, updatedProfile, 'Profile updated successfully');
  } catch (error: any) {
    return sendError(res, 'PROFILE_UPDATE_ERROR', error.message || 'Failed to update profile', 500);
  }
};

// Education Controllers
export const getEducation = async (req: Request, res: Response) => {
  try {
    const canonical = await profileService.getCanonicalProfile(req.user!.id, req.user!.email);
    const list = await educationRepository.listByStudentId(canonical.student.id);
    return sendSuccess(res, list, 'Education records retrieved');
  } catch (error: any) {
    return sendError(res, 'EDUCATION_FETCH_ERROR', error.message, 500);
  }
};

export const createEducation = async (req: Request, res: Response) => {
  try {
    const parseResult = createEducationSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid education details', 400, parseResult.error.format());
    }

    const canonical = await profileService.getCanonicalProfile(req.user!.id, req.user!.email);
    const created = await educationRepository.create(canonical.student.id, {
      institution_name: parseResult.data.institutionName,
      degree: parseResult.data.degree,
      field_of_study: parseResult.data.fieldOfStudy,
      start_date: parseResult.data.startDate,
      end_date: parseResult.data.endDate,
      gpa: parseResult.data.gpa,
      max_gpa: parseResult.data.maxGpa || 4.0,
      is_current: parseResult.data.isCurrent || false,
    });

    const updatedProfile = await profileService.getCanonicalProfile(req.user!.id, req.user!.email);
    return sendSuccess(res, { created, profile: updatedProfile }, 'Education added successfully');
  } catch (error: any) {
    return sendError(res, 'EDUCATION_CREATE_ERROR', error.message, 500);
  }
};

export const deleteEducation = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const canonical = await profileService.getCanonicalProfile(req.user!.id, req.user!.email);
    await educationRepository.delete(id, canonical.student.id);
    const updatedProfile = await profileService.getCanonicalProfile(req.user!.id, req.user!.email);
    return sendSuccess(res, updatedProfile, 'Education record removed');
  } catch (error: any) {
    return sendError(res, 'EDUCATION_DELETE_ERROR', error.message, 500);
  }
};

// Skills Controllers
export const getSkills = async (req: Request, res: Response) => {
  try {
    const canonical = await profileService.getCanonicalProfile(req.user!.id, req.user!.email);
    const list = await skillsRepository.listByStudentId(canonical.student.id);
    return sendSuccess(res, list, 'Skill records retrieved');
  } catch (error: any) {
    return sendError(res, 'SKILLS_FETCH_ERROR', error.message, 500);
  }
};

export const createSkill = async (req: Request, res: Response) => {
  try {
    const parseResult = createSkillSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid skill input', 400, parseResult.error.format());
    }

    const canonical = await profileService.getCanonicalProfile(req.user!.id, req.user!.email);
    const created = await skillsRepository.create(
      canonical.student.id,
      parseResult.data.skillName,
      parseResult.data.proficiencyLevel || 'intermediate'
    );

    const updatedProfile = await profileService.getCanonicalProfile(req.user!.id, req.user!.email);
    return sendSuccess(res, { created, profile: updatedProfile }, 'Skill added successfully');
  } catch (error: any) {
    return sendError(res, 'SKILLS_CREATE_ERROR', error.message, 500);
  }
};

export const deleteSkill = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const canonical = await profileService.getCanonicalProfile(req.user!.id, req.user!.email);
    await skillsRepository.delete(id, canonical.student.id);
    const updatedProfile = await profileService.getCanonicalProfile(req.user!.id, req.user!.email);
    return sendSuccess(res, updatedProfile, 'Skill removed');
  } catch (error: any) {
    return sendError(res, 'SKILLS_DELETE_ERROR', error.message, 500);
  }
};

// Interests Controllers
export const getInterests = async (req: Request, res: Response) => {
  try {
    const canonical = await profileService.getCanonicalProfile(req.user!.id, req.user!.email);
    const list = await interestsRepository.listByStudentId(canonical.student.id);
    return sendSuccess(res, list, 'Interest tags retrieved');
  } catch (error: any) {
    return sendError(res, 'INTERESTS_FETCH_ERROR', error.message, 500);
  }
};

export const createInterest = async (req: Request, res: Response) => {
  try {
    const parseResult = createInterestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid interest tag', 400, parseResult.error.format());
    }

    const canonical = await profileService.getCanonicalProfile(req.user!.id, req.user!.email);
    const created = await interestsRepository.create(canonical.student.id, parseResult.data.interestTag);
    const updatedProfile = await profileService.getCanonicalProfile(req.user!.id, req.user!.email);
    return sendSuccess(res, { created, profile: updatedProfile }, 'Interest tag added');
  } catch (error: any) {
    return sendError(res, 'INTERESTS_CREATE_ERROR', error.message, 500);
  }
};

export const deleteInterest = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const canonical = await profileService.getCanonicalProfile(req.user!.id, req.user!.email);
    await interestsRepository.delete(id, canonical.student.id);
    const updatedProfile = await profileService.getCanonicalProfile(req.user!.id, req.user!.email);
    return sendSuccess(res, updatedProfile, 'Interest tag removed');
  } catch (error: any) {
    return sendError(res, 'INTERESTS_DELETE_ERROR', error.message, 500);
  }
};

export const getCompletion = async (req: Request, res: Response) => {
  try {
    const canonical = await profileService.getCanonicalProfile(req.user!.id, req.user!.email);
    return sendSuccess(res, canonical.completion, 'Profile completion details');
  } catch (error: any) {
    return sendError(res, 'COMPLETION_ERROR', error.message, 500);
  }
};
