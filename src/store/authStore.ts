import { useSyncExternalStore } from 'react';
import { UserProfile, AuthSession } from '../types/auth';
import { supabase } from '../lib/supabase';
import { profileService } from '../services/profileService';

export interface AuthState {
  user: UserProfile | null;
  session: AuthSession | null;
  canonicalProfile: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

class AuthStoreSingleton {
  private state: AuthState = {
    user: null,
    session: null,
    canonicalProfile: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  };

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initAuthSession();
    this.initAuthListener();
  }

  private async initAuthSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await this.handleSession(session);
      } else {
        this.setUnauthenticated();
      }
    } catch {
      this.setUnauthenticated();
    }
  }

  private initAuthListener() {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await this.handleSession(session);
      } else if (event === 'SIGNED_OUT') {
        this.setUnauthenticated();
      }
    });
  }

  private async handleSession(session: any) {
    localStorage.setItem('scolify_auth_token', session.access_token);
    const userObj: UserProfile = {
      id: session.user.id,
      email: session.user.email || '',
      fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Student',
      avatarUrl: session.user.user_metadata?.avatar_url,
      createdAt: session.user.created_at,
      updatedAt: session.user.updated_at || session.user.created_at,
    };

    this.state = {
      user: userObj,
      session: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at || 0,
        user: userObj,
      },
      canonicalProfile: this.state.canonicalProfile,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };
    this.notify();

    // Fetch canonical profile silently
    try {
      const profileData = await profileService.getProfile();
      this.state.canonicalProfile = profileData;
      if (profileData?.profile?.full_name) {
        this.state.user = {
          ...userObj,
          fullName: profileData.profile.full_name,
        };
      }
      this.notify();
    } catch {
      // Profile load fallback
    }
  }

  private setUnauthenticated() {
    localStorage.removeItem('scolify_auth_token');
    this.state = {
      user: null,
      session: null,
      canonicalProfile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
    this.notify();
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify() {
    this.listeners.forEach((l) => l());
  }

  getState(): AuthState {
    return this.state;
  }

  setUser(user: UserProfile | null) {
    this.state.user = user;
    this.state.isAuthenticated = !!user;
    this.notify();
  }

  setCanonicalProfile(profile: any) {
    this.state.canonicalProfile = profile;
    if (profile?.profile?.full_name && this.state.user) {
      this.state.user.fullName = profile.profile.full_name;
    }
    this.notify();
  }

  async logout() {
    this.setUnauthenticated();
    await supabase.auth.signOut();
  }
}

export const authStore = new AuthStoreSingleton();

export const useAuthStore = (): AuthState => {
  return useSyncExternalStore(
    authStore.subscribe,
    () => authStore.getState(),
    () => authStore.getState()
  );
};
