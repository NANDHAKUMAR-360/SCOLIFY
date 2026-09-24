import { supabase } from '../lib/supabase';
import { AuthSession } from '../types/auth';

export const authService = {
  async register(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    if (data.session) {
      localStorage.setItem('scolify_auth_token', data.session.access_token);
    }
    return data;
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (data.session) {
      localStorage.setItem('scolify_auth_token', data.session.access_token);
    }
    return data;
  },

  async logout() {
    localStorage.removeItem('scolify_auth_token');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async forgotPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  async getCurrentSession(): Promise<AuthSession | null> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;

    localStorage.setItem('scolify_auth_token', session.access_token);

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at || 0,
      user: {
        id: session.user.id,
        email: session.user.email || '',
        fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Student',
        avatarUrl: session.user.user_metadata?.avatar_url,
        createdAt: session.user.created_at,
        updatedAt: session.user.updated_at || session.user.created_at,
      },
    };
  },
};
