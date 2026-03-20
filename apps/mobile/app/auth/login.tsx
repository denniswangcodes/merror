import React, { useState, FormEvent } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/auth.context';
import { Link } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Required', 'Enter email and password.'); return; }
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/feed');
    } catch (e) {
      Alert.alert('Login Failed', (e as Error).message);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FAFAF9' }} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.sub}>Sign in to your Merror account</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        placeholderTextColor="#9CA3AF"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
      />

      <TouchableOpacity style={[styles.btn, { marginTop: 16 }]} onPress={handleLogin} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don&apos;t have an account? </Text>
        <Link href="/auth/signup" style={styles.link}>Sign up</Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 40 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 4 },
  sub: { fontSize: 14, color: '#6B7280', marginBottom: 28 },
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
  btn: { backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 13, color: '#6B7280' },
  link: { fontSize: 13, color: '#4F46E5', fontWeight: '700' },
});
