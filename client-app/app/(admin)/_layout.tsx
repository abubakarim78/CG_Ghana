import { Redirect, Tabs } from 'expo-router';
import { BarChart2, ClipboardList, UserCircle } from 'lucide-react-native';
import { COLORS } from '../../src/theme';
import { useAuthStore } from '../../src/store';

export default function AdminLayout() {
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
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.text.muted,
      }}
    >
      <Tabs.Screen
        name="panel"
        options={{
          title: 'Panel',
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cases"
        options={{
          title: 'Cases',
          tabBarLabel: 'Cases',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <UserCircle color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
