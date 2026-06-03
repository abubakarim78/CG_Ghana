import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import {
  useFonts,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_500Medium,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../src/i18n/index';
import {
  registerForPushNotifications,
  handleForegroundNotification,
  handleNotificationResponse,
} from '../src/services/notificationService';
import { api } from '../src/services/api';
import { useAuthStore } from '../src/store/authStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_700Bold,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_500Medium,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const user = useAuthStore((s) => s.user);
  const pushTokenRef = useRef<string | null>(null);

  // Register listeners once on app mount
  useEffect(() => {
    const foregroundSub = Notifications.addNotificationReceivedListener(
      handleForegroundNotification
    );
    const responseSub = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    registerForPushNotifications()
      .then((token) => { if (token) pushTokenRef.current = token; })
      .catch(() => {}); // never let push setup crash the app

    return () => {
      foregroundSub.remove();
      responseSub.remove();
    };
  }, []);

  // Save push token to backend whenever a new user session becomes active
  useEffect(() => {
    if (user?.id && pushTokenRef.current) {
      api.auth.savePushToken(pushTokenRef.current).catch(() => {});
    }
  }, [user?.id]);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={styles.loadingContainer} />;
  }

  return (
    <SafeAreaProvider style={styles.root}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0D1620' },
        }}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    ...(Platform.OS === 'web' ? { height: '100%' as unknown as number } : {}),
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D1620',
    ...(Platform.OS === 'web' ? { height: '100%' as unknown as number } : {}),
  },
});
