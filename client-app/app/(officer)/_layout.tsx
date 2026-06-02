import { Redirect, Tabs } from 'expo-router';
import { LayoutDashboard, UserCircle } from 'lucide-react-native';
import { COLORS } from '../../src/theme';
import { useAuthStore } from '../../src/store';

export default function OfficerLayout() {
  const user = useAuthStore((s) => s.user);
  if (!user || user.isAnonymous) {
    return <Redirect href="/role-select" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(13,22,32,0.95)',
          borderTopColor: COLORS.surface.glassBorder,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: COLORS.primary[500],
        tabBarInactiveTintColor: COLORS.text.muted,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <UserCircle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="case/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
