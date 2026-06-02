import { create } from 'zustand';
import { Case, CaseStatus, CasePriority } from '../types/models';
import { api } from '../services/api';

interface CasesState {
  cases: Case[];
  officers: any[];
  stats: any | null;
  selectedCaseId: string | null;
  filterStatus: 'all' | CaseStatus;
  filterPriority: 'all' | CasePriority;
  isLoading: boolean;
  error: string | null;
  loadCases: () => Promise<void>;
  loadOfficers: () => Promise<void>;
  loadStats: () => Promise<void>;
  getCaseById: (id: string) => Case | undefined;
  fetchCaseById: (id: string) => Promise<Case | null>;
  updateCaseStatus: (caseId: string, status: CaseStatus, note: string, officerName: string) => Promise<void>;
  assignOfficer: (caseId: string, officerId: string) => Promise<void>;
  setFilter: (status: 'all' | CaseStatus, priority?: 'all' | CasePriority) => void;
  selectCase: (id: string | null) => void;
}

export const useCasesStore = create<CasesState>((set, get) => ({
  cases: [],
  officers: [],
  stats: null,
  selectedCaseId: null,
  filterStatus: 'all',
  filterPriority: 'all',
  isLoading: false,
  error: null,

  loadCases: async () => {
    set({ isLoading: true, error: null });
    try {
      const cases = await api.cases.list();
      set({ cases, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  loadOfficers: async () => {
    try {
      const officers = await api.officers.list();
      set({ officers });
    } catch {
      // non-critical — silently skip
    }
  },

  loadStats: async () => {
    try {
      const stats = await api.stats.dashboard();
      set({ stats });
    } catch {
      // non-critical
    }
  },

  getCaseById: (id: string) => get().cases.find((c) => c.id === id),

  fetchCaseById: async (id: string) => {
    try {
      return await api.cases.getById(id);
    } catch {
      return null;
    }
  },

  updateCaseStatus: async (caseId, status, note) => {
    const updated = await api.cases.updateStatus(caseId, status, note);
    set((state) => ({
      cases: state.cases.map((c) => (c.id === caseId ? updated : c)),
    }));
  },

  assignOfficer: async (caseId, officerId) => {
    const updated = await api.cases.assign(caseId, officerId);
    set((state) => ({
      cases: state.cases.map((c) => (c.id === caseId ? updated : c)),
    }));
  },

  setFilter: (status, priority) =>
    set((state) => ({
      filterStatus: status,
      filterPriority: priority !== undefined ? priority : state.filterPriority,
    })),

  selectCase: (id) => set({ selectedCaseId: id }),
}));
