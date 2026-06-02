import { create } from 'zustand';
import { api } from '../services/api';
import { useReportsStore } from './reportsStore';

export type EmergencyPhase =
  | 'idle'
  | 'holding'
  | 'activating'
  | 'dispatching'
  | 'officer_found'
  | 'error';

interface EmergencyState {
  phase: EmergencyPhase;
  holdProgress: number;
  description: string;
  assignedOfficerName: string | null;
  caseId: string | null;
  caseNumber: string | null;
  setPhase: (phase: EmergencyPhase) => void;
  setHoldProgress: (progress: number) => void;
  setDescription: (description: string) => void;
  triggerSOS: (location: { district: string; region: string; lat: number; lng: number }) => Promise<void>;
  reset: () => void;
}

export const useEmergencyStore = create<EmergencyState>((set) => ({
  phase: 'idle',
  holdProgress: 0,
  description: '',
  assignedOfficerName: null,
  caseId: null,
  caseNumber: null,

  setPhase: (phase) => set({ phase }),
  setHoldProgress: (progress) => set({ holdProgress: progress }),
  setDescription: (description) => set({ description }),

  triggerSOS: async (location) => {
    set({ phase: 'dispatching' });
    try {
      const result = await api.emergency.triggerSOS({
        location,
        isEmergency: true,
        isAnonymous: false,
        dangerTriage: { withPerp: true, recentViolence: true, noBasicNeeds: false },
      });

      const sosCase = result.case;

      // Add to reporter's local report history so it shows on the Track screen
      if (sosCase) {
        useReportsStore.getState().addReport(sosCase);
      }

      set({
        phase: 'officer_found',
        assignedOfficerName: result.assignedOfficer?.name ?? 'An officer',
        caseId: sosCase?.id ?? null,
        caseNumber: sosCase?.caseNumber ?? null,
      });
    } catch {
      set({ phase: 'error' });
    }
  },

  reset: () =>
    set({
      phase: 'idle',
      holdProgress: 0,
      description: '',
      assignedOfficerName: null,
      caseId: null,
      caseNumber: null,
    }),
}));
