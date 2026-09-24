import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phoneNumber: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  headline: z.string().max(120).optional(),
  bio: z.string().max(1000).optional(),
  dateOfBirth: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  preferredCategories: z.array(z.string()).optional(),
});

export const createEducationSchema = z.object({
  institutionName: z.string().min(2),
  degree: z.string().min(2),
  fieldOfStudy: z.string().min(2),
  startDate: z.string(),
  endDate: z.string().optional(),
  gpa: z.number().min(0).max(10).optional(),
  maxGpa: z.number().min(1).max(10).optional(),
  isCurrent: z.boolean().optional(),
});

export const createSkillSchema = z.object({
  skillName: z.string().min(1),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
});

export const createInterestSchema = z.object({
  interestTag: z.string().min(1),
});
