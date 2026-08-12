import { Stack, Redirect } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/auth.context';
import { NotificationsProvider } from '../src/context/notifications.context';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useAppTheme } from '../src/lib/theme';

function RootLayoutInner() {
  const { loading, user } = useAuth();
  const theme = useAppTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <StatusBar style={theme.dark ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <>
    <StatusBar style={theme.dark ? 'light' : 'dark'} />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background }, headerStyle: { backgroundColor: theme.surface }, headerTintColor: theme.text, headerShadowVisible: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="give/[userId]" options={{ headerShown: true, title: 'Give Feedback', headerBackTitle: 'Back' }} />
      <Stack.Screen name="profile/[username]" options={{ headerShown: true, title: 'Profile', headerBackTitle: 'Back' }} />
      <Stack.Screen name="points" options={{ headerShown: true, title: 'Lumens & Levels', headerBackTitle: 'Back' }} />
      <Stack.Screen name="auth/login" options={{ headerShown: true, title: 'Sign In', headerBackTitle: 'Back' }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: true, title: 'Create Account', headerBackTitle: 'Back' }} />
    </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationsProvider>
          <RootLayoutInner />
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
