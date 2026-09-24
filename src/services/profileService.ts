import { apiClient } from '../lib/apiClient';
import { API_ENDPOINTS } from '../config/api.config';

export interface FrontendEducationInput {
  institutionName: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  maxGpa?: number;
  isCurrent?: boolean;
}

export const profileService = {
  async getProfile() {
    const res = await apiClient(API_ENDPOINTS.PROFILE.GET);
    return res.data;
  },

  async initProfile() {
    const res = await apiClient('/profile/init', { method: 'POST' });
    return res.data;
  },

  async updateProfile(data: {
    fullName?: string;
    headline?: string;
    bio?: string;
    country?: string;
    state?: string;
    city?: string;
    dateOfBirth?: string;
    preferredCategories?: string[];
  }) {
    const res = await apiClient(API_ENDPOINTS.PROFILE.UPDATE, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async addEducation(edu: FrontendEducationInput) {
    const res = await apiClient(API_ENDPOINTS.PROFILE.EDUCATION, {
      method: 'POST',
      body: JSON.stringify(edu),
    });
    return res.data;
  },

  async deleteEducation(id: string) {
    const res = await apiClient(`${API_ENDPOINTS.PROFILE.EDUCATION}/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  async addSkill(skillName: string, proficiencyLevel: string = 'intermediate') {
    const res = await apiClient(API_ENDPOINTS.PROFILE.SKILLS, {
      method: 'POST',
      body: JSON.stringify({ skillName, proficiencyLevel }),
    });
    return res.data;
  },

  async deleteSkill(id: string) {
    const res = await apiClient(`${API_ENDPOINTS.PROFILE.SKILLS}/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  async addInterest(interestTag: string) {
    const res = await apiClient('/profile/interests', {
      method: 'POST',
      body: JSON.stringify({ interestTag }),
    });
    return res.data;
  },

  async deleteInterest(id: string) {
    const res = await apiClient(`/profile/interests/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  async getCompletion() {
    const res = await apiClient('/profile/completion');
    return res.data;
  },
};
