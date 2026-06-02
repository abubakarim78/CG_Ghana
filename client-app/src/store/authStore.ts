import { create } from 'zustand';

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  role: 'reporter' | 'officer' | 'admin';
  badgeNumber?: string;
  district?: string;
}
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/models';
import { api, storeToken, clearStoredToken } from '../services/api';

interface AuthState {
  user: User | null;
  isAnonymousMode: boolean;
  disguiseMode: boolean;
  language: 'en' | 'tw' | 'ga';
  isOnboarded: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string) => Promise<void>;
  loginAnonymous: () => Promise<void>;
  registerUser: (payload: RegisterUserPayload) => Promise<{ success: boolean; error?: string }>;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  setAnonymousMode: (value: boolean) => void;
  toggleDisguiseMode: () => void;
  setLanguage: (lang: 'en' | 'tw' | 'ga') => void;
  setOnboarded: () => void;
  clearAuthError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAnonymousMode: false,
      disguiseMode: false,
      language: 'en',
      isOnboarded: false,
      isLoading: false,
      authError: null,

      login: async (phone: string, password: string) => {
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

      register: async (name: string, phone: string, password: string) => {
        set({ isLoading: true, authError: null });
        try {
          const { token, user } = await api.auth.register({ name, phone, password });
          await storeToken(token);
          set({
            user: { id: user.id, name: user.name ?? name, role: user.role },
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
        set({ user: null, isAnonymousMode: false });
      },

      setAnonymousMode: (value: boolean) => set({ isAnonymousMode: value }),
      toggleDisguiseMode: () => set((state) => ({ disguiseMode: !state.disguiseMode })),
      setLanguage: (lang: 'en' | 'tw' | 'ga') => set({ language: lang }),
      setOnboarded: () => set({ isOnboarded: true }),
      clearAuthError: () => set({ authError: null }),

      registerUser: async (payload: RegisterUserPayload) => {
        try {
          await get().register(payload.name, payload.email, payload.password);
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.message ?? 'Registration failed' };
        }
      },

      loginWithCredentials: async (email: string, password: string) => {
        try {
          await get().login(email, password);
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.message ?? 'Login failed' };
        }
      },
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
