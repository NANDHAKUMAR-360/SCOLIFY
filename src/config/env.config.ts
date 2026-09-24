export const ENV = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Scolify',
  APP_TAGLINE: import.meta.env.VITE_APP_TAGLINE || 'Find Your Next Opportunity',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key',
  IS_DEV: import.meta.env.DEV,
};
