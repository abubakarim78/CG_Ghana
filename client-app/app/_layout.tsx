import { useEffect } from 'react';
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
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../src/i18n/index';

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

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer} />
    );
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
    // On web, flex:1 alone doesn't fill viewport — needs explicit height
    ...(Platform.OS === 'web' ? { height: '100%' as unknown as number } : {}),
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D1620',
    ...(Platform.OS === 'web' ? { height: '100%' as unknown as number } : {}),
  },
});
