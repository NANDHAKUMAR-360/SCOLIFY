import { createClient } from '@supabase/supabase-js';
import { ENV } from '../config/env.config';

// Safe Supabase client initialization
export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
