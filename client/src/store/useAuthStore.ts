import { create } from 'zustand';
import { User } from '../types/index.js';
import { apiClient } from '../api/client.js';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from localStorage
  const savedToken = localStorage.getItem('omni_token');
  const savedUser = localStorage.getItem('omni_user');

  let initialUser: User | null = null;
  if (savedUser) {
    try {
      initialUser = JSON.parse(savedUser);
    } catch {
      localStorage.removeItem('omni_user');
    }
  }

  return {
    user: initialUser,
    token: savedToken,
    isAuthenticated: !!savedToken && !!initialUser,
    isLoading: false,

    login: (token: string, user: User) => {
      localStorage.setItem('omni_token', token);
      localStorage.setItem('omni_user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true, isLoading: false });
    },

    logout: () => {
      localStorage.removeItem('omni_token');
      localStorage.removeItem('omni_user');
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    },

    fetchMe: async () => {
      const token = localStorage.getItem('omni_token');
      if (!token) {
        set({ token: null, user: null, isAuthenticated: false });
        return;
      }

      try {
        set({ isLoading: true });
        const res = await apiClient.get('/auth/me');
        if (res.data.success) {
          const user = res.data.data.user;
          localStorage.setItem('omni_user', JSON.stringify(user));
          set({ user, isAuthenticated: true, isLoading: false });
        }
      } catch {
        localStorage.removeItem('omni_token');
        localStorage.removeItem('omni_user');
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      }
    },
  };
});
