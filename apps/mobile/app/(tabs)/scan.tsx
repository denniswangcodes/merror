import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, Keyboard,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Avatar } from '../../src/components/Avatar';
import { usersApi } from '../../src/lib/api';
import type { PublicUser } from '@merror/shared';

export default function ScanScreen() {
  const router = useRouter();
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
    <View style={styles.container}>
      {/* Mode toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'search' && styles.modeBtnActive]}
          onPress={() => setMode('search')}
        >
          <Text style={[styles.modeBtnText, mode === 'search' && styles.modeBtnTextActive]}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'scan' && styles.modeBtnActive]}
          onPress={() => setMode('scan')}
        >
          <Text style={[styles.modeBtnText, mode === 'scan' && styles.modeBtnTextActive]}>Scan QR</Text>
        </TouchableOpacity>
      </View>

      {mode === 'search' ? (
        <View style={{ flex: 1 }}>
          <TextInput
            style={styles.input}
            placeholder="Search by username..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searching ? (
            <ActivityIndicator color="#4F46E5" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.userRow}
                  onPress={() => { Keyboard.dismiss(); router.push(`/give/${item.id}`); }}
                >
                  <Avatar displayName={item.displayName} username={item.username} size={40} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.displayName}>{item.displayName || item.username}</Text>
                    <Text style={styles.username}>@{item.username}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                query.length > 1 && !searching ? (
                  <Text style={styles.empty}>No users found</Text>
                ) : null
              }
            />
          )}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {!permission?.granted ? (
            <View style={styles.permContainer}>
              <Text style={styles.permText}>Camera permission needed to scan QR codes</Text>
              <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                <Text style={styles.permBtnText}>Grant Permission</Text>
              </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: '#FAFAF9' },
  modeToggle: {
    flexDirection: 'row',
    margin: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
  },
  modeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  modeBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  modeBtnText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  modeBtnTextActive: { color: '#4F46E5' },
  input: {
    marginHorizontal: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#111827',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  displayName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  username: { fontSize: 12, color: '#6B7280' },
  empty: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, marginTop: 40 },
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
  permText: { textAlign: 'center', color: '#374151', fontSize: 15, marginBottom: 20 },
  permBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  permBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
