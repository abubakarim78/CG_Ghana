import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types/models';
import { api, storeToken, clearStoredToken } from '../services/api';
import { useReportsStore } from './reportsStore';

interface AuthState {
  user: User | null;
  isAnonymousMode: boolean;
  disguiseMode: boolean;
  language: 'en' | 'tw' | 'ga';
  isOnboarded: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string, role?: UserRole) => Promise<void>;
  loginAnonymous: () => Promise<void>;
  signOut: () => Promise<void>;
  setAnonymousMode: (value: boolean) => void;
  toggleDisguiseMode: () => void;
  setLanguage: (lang: 'en' | 'tw' | 'ga') => void;
  setOnboarded: () => void;
  clearAuthError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAnonymousMode: false,
      disguiseMode: false,
      language: 'en',
      isOnboarded: false,
      isLoading: false,
      authError: null,

      login: async (phone, password) => {
        set({ isLoading: true, authError: null });
        try {
          const { token, user } = await api.auth.login(phone, password);
          await storeToken(token);
          set({
            user: { id: user.id, name: user.name ?? phone, role: user.role, officerId: user.officerId },
            isLoading: false,
          });
        } catch (err: any) {
          set({ isLoading: false, authError: err.message ?? 'Login failed' });
          throw err;
        }
      },

      register: async (name, phone, password, role = 'reporter') => {
        set({ isLoading: true, authError: null });
        try {
          const { token, user } = await api.auth.register({ name, phone, password, role });
          await storeToken(token);
          set({
            user: { id: user.id, name: user.name ?? name, role: user.role, officerId: user.officerId },
            isLoading: false,
          });
        } catch (err: any) {
          set({ isLoading: false, authError: err.message ?? 'Registration failed' });
          throw err;
        }
      },

      loginAnonymous: async () => {
        set({ isLoading: true, authError: null });
        try {
          const { token, user } = await api.auth.anonymous();
          await storeToken(token);
          // fresh anonymous session — clear any cached reports from previous sessions
          useReportsStore.getState().clearMyReports();
          set({
            user: { id: user.id, name: 'Anonymous Reporter', role: 'reporter', isAnonymous: true },
            isAnonymousMode: true,
            isLoading: false,
          });
        } catch (err: any) {
          set({ isLoading: false, authError: err.message ?? 'Failed to create anonymous session' });
          throw err;
        }
      },

      signOut: async () => {
        await clearStoredToken();
        useReportsStore.getState().clearMyReports();
        set({ user: null, isAnonymousMode: false });
      },

      setAnonymousMode: (value) => set({ isAnonymousMode: value }),
      toggleDisguiseMode: () => set((state) => ({ disguiseMode: !state.disguiseMode })),
      setLanguage: (lang) => set({ language: lang }),
      setOnboarded: () => set({ isOnboarded: true }),
      clearAuthError: () => set({ authError: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAnonymousMode: state.isAnonymousMode,
        disguiseMode: state.disguiseMode,
        language: state.language,
        isOnboarded: state.isOnboarded,
      }),
    }
  )
);
