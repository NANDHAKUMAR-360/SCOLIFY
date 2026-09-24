export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  PROFILE: {
    GET: '/profile',
    UPDATE: '/profile',
    EDUCATION: '/profile/education',
    SKILLS: '/profile/skills',
  },
  OPPORTUNITIES: {
    LIST: '/opportunities',
    DETAIL: (id: string) => `/opportunities/${id}`,
    MATCH: '/opportunities/match',
  },
  SCHOLARSHIPS: {
    LIST: '/scholarships',
  },
  INTERNSHIPS: {
    LIST: '/internships',
  },
  DOCUMENTS: {
    LIST: '/documents',
    UPLOAD: '/documents/upload',
  },
  APPLICATIONS: {
    LIST: '/applications',
    CREATE: '/applications',
    APPROVE: (id: string) => `/applications/${id}/approve`,
  },
  AGENTS: {
    ORCHESTRATE: '/agents/orchestrate',
    VERIFY_COMPANY: '/agents/verify-company',
  },
};
