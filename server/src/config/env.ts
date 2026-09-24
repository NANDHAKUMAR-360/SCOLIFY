import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
  GROQ_API_KEY: process.env.GROQ_API_KEY || 'gsk_placeholder',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
