import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Case, ReportDraft } from '../types/models';
import { api } from '../services/api';

const INITIAL_DRAFT: ReportDraft = {
  type: undefined,
  isEmergency: false,
  childAge: undefined,
  childGender: undefined,
  childDescription: undefined,
  location: undefined,
  locationText: undefined,
  description: '',
  photos: [],
  isAnonymous: false,
  dangerTriage: {
    withPerp: false,
    recentViolence: false,
    noBasicNeeds: false,
  },
};

interface ReportsState {
  myReports: Case[];
  draft: ReportDraft;
  currentStep: number;
  isSubmitting: boolean;
  submitError: string | null;
  addReport: (report: Case) => void;
  updateDraft: (partial: Partial<ReportDraft>) => void;
  resetDraft: () => void;
  clearMyReports: () => void;
  setStep: (n: number) => void;
  submitDraft: () => Promise<Case>;
  getReportById: (id: string) => Case | undefined;
}

export const useReportsStore = create<ReportsState>()(
  persist(
    (set, get) => ({
      myReports: [],
      draft: INITIAL_DRAFT,
      currentStep: 0,
      isSubmitting: false,
      submitError: null,

      addReport: (report: Case) =>
        set((state) => ({ myReports: [...state.myReports, report] })),

      updateDraft: (partial: Partial<ReportDraft>) =>
        set((state) => ({ draft: { ...state.draft, ...partial } })),

      resetDraft: () => set({ draft: INITIAL_DRAFT, currentStep: 0 }),

      clearMyReports: () => set({ myReports: [], draft: INITIAL_DRAFT, currentStep: 0 }),

      setStep: (n: number) => set({ currentStep: n }),

      submitDraft: async () => {
        const { draft } = get();
        set({ isSubmitting: true, submitError: null });
        try {
          const newCase = await api.cases.submit({
            type: draft.type ?? 'neglect',
            childAge: draft.childAge ?? 0,
            childGender: draft.childGender ?? 'unknown',
            location: draft.location ?? { district: 'Unknown', region: 'Unknown', lat: 0, lng: 0 },
            description: draft.description,
            photos: draft.photos,
            isAnonymous: draft.isAnonymous,
            isEmergency: draft.isEmergency,
            dangerTriage: draft.dangerTriage,
          });
          set((state) => ({
            myReports: [...state.myReports, newCase],
            isSubmitting: false,
          }));
          return newCase;
        } catch (err: any) {
          set({ isSubmitting: false, submitError: err.message });
          throw err;
        }
      },

      getReportById: (id: string) => get().myReports.find((r) => r.id === id),
    }),
    {
      name: 'reports-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
