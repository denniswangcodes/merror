import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, Keyboard,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../src/components/Avatar';
import { GradientButton } from '../../src/components/GradientButton';
import { usersApi } from '../../src/lib/api';
import { useAppTheme } from '../../src/lib/theme';
import type { PublicUser } from '@merror/shared';

export default function ScanScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const [mode, setMode] = useState<'search' | 'scan'>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await usersApi.search(query) as PublicUser[];
        setResults(res);
      } catch { setResults([]); }
      setSearching(false);
    }, 350);
  }, [query]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    try {
      const user = await usersApi.getByQr(data) as PublicUser;
      router.push(`/give/${user.id}`);
    } catch {
      Alert.alert('Not Found', 'No Merror user found with that QR code.', [
        { text: 'Retry', onPress: () => setScanned(false) },
      ]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Mode toggle */}
      <View style={[styles.modeToggle, { backgroundColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'search' && { backgroundColor: theme.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }]}
          onPress={() => setMode('search')}
        >
          <Text style={[styles.modeBtnText, { color: theme.muted }, mode === 'search' && { color: theme.accent }]}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'scan' && { backgroundColor: theme.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }]}
          onPress={() => setMode('scan')}
        >
          <Text style={[styles.modeBtnText, { color: theme.muted }, mode === 'scan' && { color: theme.accent }]}>Scan QR</Text>
        </TouchableOpacity>
      </View>

      {mode === 'search' ? (
        <View style={{ flex: 1 }}>
          <TextInput
            style={[styles.input, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
            placeholder="Search by username..."
            placeholderTextColor={theme.muted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searching ? (
            <ActivityIndicator color={theme.accent} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.userRow, { borderBottomColor: theme.border }]}
                  onPress={() => { Keyboard.dismiss(); router.push(`/give/${item.id}`); }}
                >
                  <Avatar displayName={item.displayName} username={item.username} size={40} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={[styles.displayName, { color: theme.text }]}>{item.displayName || item.username}</Text>
                    <Text style={[styles.username, { color: theme.muted }]}>@{item.username}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                query.length > 1 && !searching ? (
                  <Text style={[styles.empty, { color: theme.muted }]}>No users found</Text>
                ) : null
              }
              ListFooterComponent={
                <TouchableOpacity
                  style={[styles.journalRow, { borderColor: theme.border }]}
                  onPress={() => router.push('/give/journal')}
                >
                  <View style={[styles.journalIcon, { backgroundColor: `${theme.accent}1A` }]}>
                    <Ionicons name="book-outline" size={16} color={theme.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.journalTitle, { color: theme.text }]}>Not on Merror yet?</Text>
                    <Text style={[styles.journalCopy, { color: theme.muted }]}>Journal the good deed anyway — it's just for you</Text>
                  </View>
                </TouchableOpacity>
              }
            />
          )}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {!permission?.granted ? (
            <View style={styles.permContainer}>
              <Text style={[styles.permText, { color: theme.textSecondary }]}>Camera permission needed to scan QR codes</Text>
              <GradientButton style={styles.permBtn} onPress={requestPermission} label="Grant Permission" textStyle={styles.permBtnText} />
            </View>
          ) : (
            <CameraView
              style={{ flex: 1 }}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            >
              <View style={styles.overlay}>
                <View style={styles.scanBox} />
                <Text style={styles.scanHint}>Point at a Merror QR code</Text>
              </View>
            </CameraView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modeToggle: {
    flexDirection: 'row',
    margin: 12,
    borderRadius: 10,
    padding: 4,
  },
  modeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  modeBtnText: { fontSize: 13, fontWeight: '600' },
  input: {
    marginHorizontal: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  displayName: { fontSize: 14, fontWeight: '600' },
  username: { fontSize: 12 },
  empty: { textAlign: 'center', fontSize: 14, marginTop: 40 },
  journalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, marginHorizontal: 12, borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 14 },
  journalIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  journalTitle: { fontSize: 13, fontWeight: '700' },
  journalCopy: { fontSize: 11, marginTop: 2 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.35)' },
  scanBox: {
    width: 220,
    height: 220,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
  },
  scanHint: { color: '#fff', fontSize: 14, fontWeight: '600' },
  permContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  permText: { textAlign: 'center', fontSize: 15, marginBottom: 20 },
  permBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  permBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
