export type OpportunityCategory =
  | 'scholarship'
  | 'internship'
  | 'fellowship'
  | 'competition'
  | 'grant'
  | 'research'
  | 'apprenticeship'
  | 'career'
  | 'other';

export interface EducationRecord {
  id: string;
  institutionName: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  maxGpa?: number;
  isCurrent: boolean;
}

export interface StudentSkill {
  id: string;
  skillName: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified: boolean;
}

export interface StudentInterest {
  id: string;
  interestTag: string;
}

export interface StudentProfile {
  id: string;
  profileId: string;
  bio?: string;
  headline?: string;
  dateOfBirth?: string;
  country?: string;
  state?: string;
  city?: string;
  preferredCategories: OpportunityCategory[];
  completionPercentage: number;
  education: EducationRecord[];
  skills: StudentSkill[];
  interests: StudentInterest[];
  createdAt: string;
  updatedAt: string;
}
