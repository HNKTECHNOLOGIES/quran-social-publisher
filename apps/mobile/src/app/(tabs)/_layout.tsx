import { Redirect, Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useAuth } from '@/lib/auth';
import { LoadingScreen } from '@/components/ui';
import { colors, headerOptions } from '@/theme';

function TabIcon({ glyph }: { glyph: string }) {
  return <Text style={{ fontSize: 18 }}>{glyph}</Text>;
}

export default function TabsLayout() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        ...headerOptions,
        tabBarActiveTintColor: colors.emerald800,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopColor: colors.line,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: () => <TabIcon glyph="🏠" />,
        }}
      />
      <Tabs.Screen
        name="surahs"
        options={{
          title: 'Sourates',
          tabBarIcon: () => <TabIcon glyph="📖" />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Recherche',
          tabBarIcon: () => <TabIcon glyph="🔍" />,
        }}
      />
    </Tabs>
  );
}
