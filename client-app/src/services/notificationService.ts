import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useNotificationStore } from '../store/notificationStore';

// ─── Foreground display behaviour ────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Android channel ──────────────────────────────────────────────────────────
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('childguard', {
    name: 'ChildGuard Alerts',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#0E8FA8',
    sound: 'default',
  });
}

// ─── Permission + token registration ─────────────────────────────────────────
export async function registerForPushNotifications(): Promise<string | null> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  try {
    const projectId =
      (Constants.expoConfig?.extra as any)?.eas?.projectId ??
      (Constants as any).easConfig?.projectId;

    const result = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    return result.data;
  } catch (err) {
    console.warn('[ChildGuard] Push token registration failed:', err);
    return null;
  }
}

// ─── Foreground notification → in-app notification store ──────────────────────
export function handleForegroundNotification(
  notification: Notifications.Notification
): void {
  const { title, body, data } = notification.request.content;
  useNotificationStore.getState().addNotification({
    caseId: (data as Record<string, unknown>)?.caseId as string ?? '',
    title: title ?? 'ChildGuard',
    body: body ?? '',
  });
}

// ─── Notification tap → navigate to the relevant case ────────────────────────
export function handleNotificationResponse(
  response: Notifications.NotificationResponse
): void {
  const data = response.notification.request.content.data as Record<string, unknown>;
  const caseId = data?.caseId as string | undefined;
  if (!caseId) return;

  // Lazy import avoids circular dep with expo-router at module load time
  import('expo-router').then(({ router }) => {
    router.push({
      pathname: '/(reporter)/track',
      params: { prefill: caseId },
    } as any);
  });
}
