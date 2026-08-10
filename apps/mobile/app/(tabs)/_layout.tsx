import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useNotifications } from '../../src/context/notifications.context';
import { useAppTheme } from '../../src/lib/theme';

function TabIcon({ icon, focused, color }: { icon: string; focused: boolean; color: string }) {
  return <Text style={{ fontSize: 20, color, fontWeight: focused ? '800' : '500' }}>{icon}</Text>;
}

export default function TabsLayout() {
  const { pendingFriendCount, unreadCount } = useNotifications();
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 1 },
        tabBarItemStyle: { paddingTop: 5 },
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 66,
          paddingBottom: 9,
        },
        headerStyle: { backgroundColor: theme.surface },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800', color: theme.text, fontSize: 17 },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="⌂" focused={focused} color={color} />,
          headerTitle: 'Merror',
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Recognize',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="＋" focused={focused} color={color} />,
          headerTitle: 'Recognize someone',
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="♡" focused={focused} color={color} />,
          tabBarBadge: pendingFriendCount > 0 ? pendingFriendCount : undefined,
          headerTitle: 'Friends',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Me',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="◉" focused={focused} color={color} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          headerTitle: 'My Profile',
        }}
      />
    </Tabs>
  );
}
