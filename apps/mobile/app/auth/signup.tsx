import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/auth.context';
import { GradientButton } from '../../src/components/GradientButton';
import { Link } from 'expo-router';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', username: '', displayName: '' });
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    const { email, password, username, displayName } = form;
    if (!email || !password || !username) { Alert.alert('Required', 'Email, password, and username are required.'); return; }
    if (password.length < 8) { Alert.alert('Password', 'Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await signup(email, password, username, displayName || undefined);
      router.replace('/(tabs)/feed');
    } catch (e) {
      Alert.alert('Signup Failed', (e as Error).message);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FAFAF9' }} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Join Merror</Text>
      <Text style={styles.sub}>Start spreading good vibes ✨</Text>

      {(['email', 'username', 'displayName', 'password'] as const).map((key) => (
        <View key={key}>
          <Text style={styles.label}>
            {key === 'displayName' ? 'Display Name (optional)' : key.charAt(0).toUpperCase() + key.slice(1)}
          </Text>
          <TextInput
            style={styles.input}
            value={form[key]}
            onChangeText={(v) => setForm((prev) => ({ ...prev, [key]: v }))}
            placeholder={key === 'username' ? 'lowercase_only' : key === 'email' ? 'you@example.com' : key === 'password' ? 'Min 8 characters' : 'Your Name'}
            placeholderTextColor="#9CA3AF"
            keyboardType={key === 'email' ? 'email-address' : 'default'}
            secureTextEntry={key === 'password'}
            autoCapitalize={key === 'email' || key === 'username' ? 'none' : 'words'}
          />
        </View>
      ))}

      <GradientButton style={styles.btn} onPress={handleSignup} loading={loading} label={loading ? 'Creating account...' : 'Create Account'} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/auth/login" style={styles.link}>Sign in</Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 40 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 4 },
  sub: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
    marginBottom: 14,
  },
  btn: { paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 13, color: '#6B7280' },
  link: { fontSize: 13, color: '#BE5B8E', fontWeight: '700' },
});
