import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store';

export default function IndexScreen() {
  const user = useAuthStore((s) => s.user);
  const isOnboarded = useAuthStore((s) => s.isOnboarded);

  if (!isOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  if (user?.role === 'officer') {
    return <Redirect href="/(officer)/dashboard" />;
  }

  if (user?.role === 'admin') {
    return <Redirect href="/(admin)/panel" />;
  }

  if (user?.role === 'reporter') {
    return <Redirect href="/(reporter)" />;
  }

  // No user — show role select
  return <Redirect href="/role-select" />;
}
