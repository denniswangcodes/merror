import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
  TextInput, Alert, RefreshControl, Linking, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useRouter, useFocusEffect } from 'expo-router';
import { Avatar } from '../../src/components/Avatar';
import { Badge } from '../../src/components/Badge';
import { TierBadge } from '../../src/components/TierBadge';
import { useAuth } from '../../src/context/auth.context';
import { authApi, feedbackApi, usersApi } from '../../src/lib/api';
import { useAppTheme, useThemeMode } from '../../src/lib/theme';
import { formatReflectionDate } from '@merror/shared';
import type { FeedbackItem, PaginatedResponse } from '@merror/shared';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { mode, toggle: toggleTheme } = useThemeMode();
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const [received, setReceived] = useState<FeedbackItem[]>([]);
  const [tab, setTab] = useState<'received' | 'given'>('received');
  const [given, setGiven] = useState<FeedbackItem[]>([]);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const loadFeedback = useCallback(async () => {
    if (!user) return;
    await Promise.all([
      feedbackApi.getReceived().then((r) => setReceived((r as PaginatedResponse<FeedbackItem>).data)),
      feedbackApi.getGiven().then((r) => setGiven((r as PaginatedResponse<FeedbackItem>).data)),
    ]);
  }, [user]);

  useFocusEffect(useCallback(() => {
    if (!user) return;
    setBio(user.bio || '');
    setDisplayName(user.displayName || '');
    loadFeedback();
  }, [user, loadFeedback]));

  useEffect(() => {
    if (!user) return;
    setBio(user.bio || '');
    setDisplayName(user.displayName || '');
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshUser(), loadFeedback()]);
    setRefreshing(false);
  }, [refreshUser, loadFeedback]);

  if (authLoading) return <View style={[styles.center, { backgroundColor: theme.background }]}><ActivityIndicator color={theme.accent} /></View>;

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.hint, { color: theme.muted }]}>Sign in to see your profile</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.accent }]} onPress={() => router.push('/auth/login')}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try { await usersApi.updateProfile({ displayName, bio }); await refreshUser(); }
    catch { /* noop */ }
    setSaving(false);
  };

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: async () => { await logout(); } },
    ]);
  };

  const items = tab === 'received' ? received : given;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
    >
      <View style={styles.header}>
        <Avatar displayName={user.displayName} username={user.username} size={72} />

        {editing ? (
          <View style={{ width: '100%', marginTop: 12 }}>
            <Text style={[styles.label, { color: theme.muted }]}>Display Name</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
              value={displayName}
              onChangeText={setDisplayName}
              maxLength={60}
              placeholderTextColor={theme.muted}
            />
            <Text style={[styles.label, { color: theme.muted }]}>Bio</Text>
            <TextInput
              style={[styles.input, { height: 70, borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
              value={bio}
              onChangeText={setBio}
              maxLength={200}
              multiline
              placeholderTextColor={theme.muted}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity style={[styles.btn, { flex: 1, backgroundColor: theme.accent }]} onPress={handleSave} disabled={saving}>
                <Text style={styles.btnText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.outlineBtn, { flex: 1, borderColor: theme.accent }]} onPress={() => setEditing(false)}>
                <Text style={[styles.outlineBtnText, { color: theme.accent }]}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={[styles.name, { color: theme.text }]}>{user.displayName || user.username}</Text>
            {user.bio ? <Text style={[styles.bio, { color: theme.textSecondary }]}>{user.bio}</Text> : null}
            <Text style={[styles.uname, { color: theme.muted }]}>@{user.username}</Text>
          </>
        )}

        <View style={styles.pointsRow}>
          <Text style={[styles.pointsNum, { color: theme.accent }]}>{user.totalPoints}</Text>
          <Text style={[styles.lumenMark, { color: theme.accent }]} accessibilityLabel="lumens">✦</Text>
          <TierBadge points={user.totalPoints} />
        </View>

        {/* QR Code */}
        <View style={[styles.qrContainer, { backgroundColor: '#fff', borderColor: theme.border }]}>
          <QRCode value={user.qrCode} size={120} />
          <Text style={[styles.qrHint, { color: theme.muted }]}>Your Merror code</Text>
        </View>

        {!editing && (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <TouchableOpacity style={[styles.outlineBtn, { borderColor: theme.accent }]} onPress={() => setEditing(true)}>
              <Text style={[styles.outlineBtnText, { color: theme.accent }]}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.outlineBtn, { borderColor: theme.accent }]} onPress={handleLogout}>
              <Text style={[styles.outlineBtnText, { color: theme.accent }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Settings — revealed once you tap Edit Profile */}
        {editing && (
          <View style={[styles.settingsPanel, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <View style={styles.settingRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name={mode === 'dark' ? 'moon' : 'sunny'} size={16} color={theme.textSecondary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
              </View>
              <Switch value={mode === 'dark'} onValueChange={toggleTheme} trackColor={{ false: theme.borderStrong, true: theme.accent }} thumbColor="#fff" />
            </View>

            <View style={[styles.accountSection, { borderTopColor: theme.border }]}>
              <Text style={[styles.accountTitle, { color: theme.text }]}>Account and safety</Text>
              <View style={styles.legalRow}>
                <TouchableOpacity onPress={() => Linking.openURL('https://merror.vercel.app/en/community-guidelines')}><Text style={styles.legalLink}>Guidelines</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('https://merror.vercel.app/en/privacy')}><Text style={styles.legalLink}>Privacy</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('https://merror.vercel.app/en/terms')}><Text style={styles.legalLink}>Terms</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('https://merror.vercel.app/en/support')}><Text style={styles.legalLink}>Support</Text></TouchableOpacity>
              </View>
              {!showDelete ? (
                <TouchableOpacity style={styles.deleteOutline} onPress={() => setShowDelete(true)}><Text style={styles.deleteText}>Delete account</Text></TouchableOpacity>
              ) : (
                <View style={styles.deletePanel}>
                  <Text style={styles.deleteTitle}>Permanently delete your account?</Text>
                  <Text style={styles.deleteCopy}>Your profile, reflections, friendships, and associated content will be removed. This cannot be undone.</Text>
                  <TextInput secureTextEntry autoCapitalize="none" style={[styles.input, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]} value={deletePassword} onChangeText={setDeletePassword} placeholder="Confirm your password" placeholderTextColor={theme.muted} />
                  <View style={styles.deleteActions}>
                    <TouchableOpacity disabled={!deletePassword || deleting} style={[styles.deleteButton, (!deletePassword || deleting) && { opacity: 0.5 }]} onPress={async () => {
                      setDeleting(true);
                      try { await authApi.deleteAccount(deletePassword); await logout(); router.replace('/auth/signup'); }
                      catch (error) { Alert.alert('Could not delete account', (error as Error).message); }
                      finally { setDeleting(false); }
                    }}><Text style={styles.deleteButtonText}>{deleting ? 'Deleting…' : 'Delete permanently'}</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.cancelDelete, { borderColor: theme.border }]} onPress={() => { setShowDelete(false); setDeletePassword(''); }}><Text style={[styles.outlineBtnText, { color: theme.accent }]}>Cancel</Text></TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: theme.border }]}>
        {(['received', 'given'] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && { borderBottomWidth: 2, borderBottomColor: theme.accent }]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, { color: theme.muted }, tab === t && { fontWeight: '700', color: theme.accent }]}>
              {t === 'received' ? `Received (${received.length})` : `Given (${given.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
        {items.length === 0 ? (
          <Text style={[styles.empty, { color: theme.muted }]}>No {tab} feedback yet</Text>
        ) : (
          items.map((item) => {
            const other = tab === 'received' ? item.giver : item.receiver;
            const otherLabel = other ? (other.displayName || other.username) : (tab === 'given' ? item.recipientName || 'someone' : null);
            return (
              <View key={item.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.cardHeader}>
                  {otherLabel && <Text style={[styles.cardUser, { color: theme.textSecondary }]}>{otherLabel}</Text>}
                  <Badge type={item.type} />
                  <Text style={[styles.cardTime, { color: theme.muted }]}>{formatReflectionDate(item.createdAt)}</Text>
                </View>
                <Text style={[styles.cardMsg, { color: theme.text }]}>&ldquo;{item.message}&rdquo;</Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  hint: { fontSize: 15 },
  btn: { paddingHorizontal: 20, paddingVertical: 11, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  outlineBtn: { borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12, alignItems: 'center' },
  outlineBtnText: { fontWeight: '700', fontSize: 13 },
  header: { alignItems: 'center', padding: 20, paddingBottom: 8 },
  name: { fontSize: 20, fontWeight: '700', marginTop: 10 },
  uname: { fontSize: 12, marginTop: 4 },
  bio: { fontSize: 13, textAlign: 'center', marginTop: 4, paddingHorizontal: 20, lineHeight: 18 },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  pointsNum: { fontSize: 22, fontWeight: '800' },
  lumenMark: { fontSize: 17, fontWeight: '700' },
  qrContainer: { alignItems: 'center', padding: 16, borderRadius: 14, marginTop: 14, borderWidth: 1 },
  qrHint: { fontSize: 11, marginTop: 8 },
  label: { fontSize: 11, fontWeight: '600', marginBottom: 4, marginTop: 4 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, width: '100%' },
  settingsPanel: { width: '100%', marginTop: 16, borderRadius: 14, borderWidth: 1, padding: 14 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingLabel: { fontSize: 13, fontWeight: '600' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, marginTop: 16 },
  tab: { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '500' },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  cardUser: { fontSize: 13, fontWeight: '600' },
  cardTime: { fontSize: 11, marginLeft: 'auto' },
  cardMsg: { fontSize: 15, lineHeight: 22 },
  empty: { textAlign: 'center', fontSize: 14, marginTop: 40 },
  accountSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  accountTitle: { fontSize: 15, fontWeight: '700' },
  legalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 12 },
  legalLink: { color: '#6D5BFF', fontSize: 12, fontWeight: '600' },
  deleteOutline: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#DC6B75', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, marginTop: 18 },
  deleteText: { color: '#B4232E', fontSize: 12, fontWeight: '700' },
  deletePanel: { marginTop: 18, borderWidth: 1, borderColor: '#F0B9BE', backgroundColor: '#FFF7F7', borderRadius: 14, padding: 14 },
  deleteTitle: { color: '#111827', fontSize: 14, fontWeight: '700' },
  deleteCopy: { color: '#6B7280', fontSize: 12, lineHeight: 18, marginTop: 4, marginBottom: 12 },
  deleteActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  deleteButton: { backgroundColor: '#B4232E', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10 },
  deleteButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  cancelDelete: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10 },
});
