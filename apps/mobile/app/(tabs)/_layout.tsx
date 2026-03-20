import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icon}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: '700', color: '#111827' },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ focused }) => <TabIcon icon="⌂" focused={focused} />,
          headerTitle: 'Merror ✨',
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Give',
          tabBarIcon: ({ focused }) => <TabIcon icon="＋" focused={focused} />,
          headerTitle: 'Give Feedback',
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ focused }) => <TabIcon icon="♡" focused={focused} />,
          headerTitle: 'Friends',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Me',
          tabBarIcon: ({ focused }) => <TabIcon icon="◉" focused={focused} />,
          headerTitle: 'My Profile',
        }}
      />
    </Tabs>
  );
}
