export interface ProfileRecord {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentRecord {
  id: string;
  profile_id: string;
  bio?: string;
  headline?: string;
  date_of_birth?: string;
  country?: string;
  state?: string;
  city?: string;
  preferred_categories: string[];
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface EducationRecord {
  id: string;
  student_id: string;
  institution_name: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  gpa?: number;
  max_gpa?: number;
  is_current: boolean;
  created_at: string;
}

export interface SkillRecord {
  id: string;
  student_id: string;
  skill_name: string;
  proficiency_level: string;
  verified: boolean;
  created_at: string;
}

export interface InterestRecord {
  id: string;
  student_id: string;
  interest_tag: string;
  created_at: string;
}

export interface FullCanonicalProfile {
  profile: ProfileRecord;
  student: StudentRecord;
  education: EducationRecord[];
  skills: SkillRecord[];
  interests: InterestRecord[];
  completion: {
    percentage: number;
    completedSections: string[];
    incompleteSections: string[];
    nextAction: string;
  };
}
