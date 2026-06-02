import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineQueueItem } from '../types/models';

type EnqueuePayload = Omit<OfflineQueueItem, 'id' | 'createdAt' | 'retryCount'>;

interface OfflineState {
  isOnline: boolean;
  queue: OfflineQueueItem[];
  lastSyncedAt: string | null;
  isSyncing: boolean;
  setOnline: (value: boolean) => void;
  enqueue: (item: EnqueuePayload) => void;
  dequeue: (id: string) => void;
  clearQueue: () => void;
  setSyncing: (value: boolean) => void;
  setLastSynced: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      isOnline: true,
      queue: [],
      lastSyncedAt: null,
      isSyncing: false,

      setOnline: (value: boolean) => set({ isOnline: value }),

      enqueue: (item: EnqueuePayload) => {
        const state = get();
        const newItem: OfflineQueueItem = {
          ...item,
          id: String(state.queue.length + 1),
          createdAt: new Date().toISOString(),
          retryCount: 0,
        };
        set({ queue: [...state.queue, newItem] });
      },

      dequeue: (id: string) =>
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== id),
        })),

      clearQueue: () => set({ queue: [] }),

      setSyncing: (value: boolean) => set({ isSyncing: value }),

      setLastSynced: () =>
        set({ isSyncing: false, lastSyncedAt: new Date().toISOString() }),
    }),
    {
      name: 'offline-queue',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
