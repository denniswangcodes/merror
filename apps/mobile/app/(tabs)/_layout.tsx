import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../../src/context/notifications.context';
import { useAppTheme } from '../../src/lib/theme';
import { LOGO_START } from '../../src/context/theme.context';
import { HeaderLogo } from '../../src/components/Logo';

type IoniconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, outlineName, focused, color }: { name: IoniconName; outlineName: IoniconName; focused: boolean; color: string }) {
  return <Ionicons name={focused ? name : outlineName} size={22} color={color} />;
}

export default function TabsLayout() {
  const { pendingFriendCount, unreadCount } = useNotifications();
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'left',
        headerTitle: () => <HeaderLogo />,
        tabBarActiveTintColor: LOGO_START,
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
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ focused, color }) => <TabIcon name="home" outlineName="home-outline" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Reflect',
          tabBarIcon: ({ focused, color }) => <TabIcon name="sparkles" outlineName="sparkles-outline" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ focused, color }) => <TabIcon name="people" outlineName="people-outline" focused={focused} color={color} />,
          tabBarBadge: pendingFriendCount > 0 ? pendingFriendCount : undefined,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ focused, color }) => <TabIcon name="notifications" outlineName="notifications-outline" focused={focused} color={color} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Me',
          tabBarIcon: ({ focused, color }) => <TabIcon name="person-circle" outlineName="person-circle-outline" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}
