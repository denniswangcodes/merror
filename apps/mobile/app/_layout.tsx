import { Stack, Redirect } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/auth.context';
import { NotificationsProvider } from '../src/context/notifications.context';
import { View, ActivityIndicator } from 'react-native';

function RootLayoutInner() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="give/[userId]" options={{ headerShown: true, title: 'Give Feedback', headerBackTitle: 'Back' }} />
      <Stack.Screen name="profile/[username]" options={{ headerShown: true, title: 'Profile', headerBackTitle: 'Back' }} />
      <Stack.Screen name="auth/login" options={{ headerShown: true, title: 'Sign In', headerBackTitle: 'Back' }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: true, title: 'Create Account', headerBackTitle: 'Back' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <RootLayoutInner />
      </NotificationsProvider>
    </AuthProvider>
  );
}
