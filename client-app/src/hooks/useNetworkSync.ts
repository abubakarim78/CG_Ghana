import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useOfflineStore } from '../store/offlineStore';

export function useNetworkSync() {
  const { isOnline, queue, isSyncing, lastSyncedAt, setOnline, setSyncing, clearQueue, setLastSynced } =
    useOfflineStore();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!(state.isConnected && state.isInternetReachable !== false);
      setOnline(online);

      if (online && queue.length > 0 && !isSyncing) {
        setSyncing(true);
        setTimeout(() => {
          clearQueue();
          setLastSynced();
        }, 1500);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queue.length, isSyncing]);

  return {
    isOnline,
    queueCount: queue.length,
    isSyncing,
    lastSyncedAt,
  };
}
