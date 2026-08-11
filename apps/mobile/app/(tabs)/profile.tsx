import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
  TextInput, Alert, RefreshControl, Linking,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useRouter, useFocusEffect } from 'expo-router';
import { Avatar } from '../../src/components/Avatar';
import { Badge } from '../../src/components/Badge';
import { TierBadge } from '../../src/components/TierBadge';
import { useAuth } from '../../src/context/auth.context';
import { authApi, feedbackApi, usersApi, notificationsApi } from '../../src/lib/api';
import { useNotifications } from '../../src/context/notifications.context';
import { formatReflectionDate } from '@merror/shared';
import type { FeedbackItem, PaginatedResponse } from '@merror/shared';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const { refresh: refreshNotifications } = useNotifications();
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
    notificationsApi.markAllRead().then(() => refreshNotifications()).catch(() => {});
  }, [user, loadFeedback, refreshNotifications]));

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

  if (authLoading) return <View style={styles.center}><ActivityIndicator color="#BE5B8E" /></View>;

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.hint}>Sign in to see your profile</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try { await usersApi.updateProfile({ displayName, bio }); await refreshUser(); setEditing(false); }
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
      style={{ flex: 1, backgroundColor: '#FAFAF9' }}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#BE5B8E" />}
    >
      <View style={styles.header}>
        <Avatar displayName={user.displayName} username={user.username} size={72} />

        {editing ? (
          <View style={{ width: '100%', marginTop: 12 }}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              maxLength={60}
            />
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, { height: 70 }]}
              value={bio}
              onChangeText={setBio}
              maxLength={200}
              multiline
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={handleSave} disabled={saving}>
                <Text style={styles.btnText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.outlineBtn, { flex: 1 }]} onPress={() => setEditing(false)}>
                <Text style={styles.outlineBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.name}>{user.displayName || user.username}</Text>
            {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
            <Text style={styles.uname}>@{user.username}</Text>
          </>
        )}

        <View style={styles.pointsRow}>
          <Text style={styles.pointsNum}>{user.totalPoints}</Text>
          <Text style={styles.lumenMark} accessibilityLabel="lumens">✦</Text>
          <TierBadge points={user.totalPoints} />
        </View>

        {/* QR Code */}
        <View style={styles.qrContainer}>
          <QRCode value={user.qrCode} size={120} />
          <Text style={styles.qrHint}>Your Merror code</Text>
        </View>

        {!editing && (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <TouchableOpacity style={styles.outlineBtn} onPress={() => setEditing(true)}>
              <Text style={styles.outlineBtnText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn} onPress={handleLogout}>
              <Text style={styles.outlineBtnText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['received', 'given'] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'received' ? `Received (${received.length})` : `Given (${given.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
        {items.length === 0 ? (
          <Text style={styles.empty}>No {tab} feedback yet</Text>
        ) : (
          items.map((item) => {
            const other = tab === 'received'
              ? (item as FeedbackItem & { giver?: { displayName?: string | null; username: string } }).giver
              : (item as FeedbackItem & { receiver?: { displayName?: string | null; username: string } }).receiver;
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  {other && <Text style={styles.cardUser}>{other.displayName || other.username}</Text>}
                  <Badge type={item.type} />
                  <Text style={styles.cardTime}>{formatReflectionDate(item.createdAt)}</Text>
                </View>
                <Text style={styles.cardMsg}>&ldquo;{item.message}&rdquo;</Text>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.accountSection}>
        <Text style={styles.accountTitle}>Account and safety</Text>
        <View style={styles.legalRow}>
          <TouchableOpacity onPress={() => Linking.openURL('https://merror.vercel.app/en/community-guidelines')}><Text style={styles.legalLink}>Guidelines</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://merror.vercel.app/en/privacy')}><Text style={styles.legalLink}>Privacy</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://merror.vercel.app/en/terms')}><Text style={styles.legalLink}>Terms</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://merror.vercel.app/en/support')}><Text style={styles.legalLink}>Support</Text></TouchableOpacity>
        </View>
        {!showDelete ? <TouchableOpacity style={styles.deleteOutline} onPress={() => setShowDelete(true)}><Text style={styles.deleteText}>Delete account</Text></TouchableOpacity> : <View style={styles.deletePanel}>
          <Text style={styles.deleteTitle}>Permanently delete your account?</Text>
          <Text style={styles.deleteCopy}>Your profile, reflections, friendships, and associated content will be removed. This cannot be undone.</Text>
          <TextInput secureTextEntry autoCapitalize="none" style={styles.input} value={deletePassword} onChangeText={setDeletePassword} placeholder="Confirm your password" placeholderTextColor="#8A8791" />
          <View style={styles.deleteActions}><TouchableOpacity disabled={!deletePassword || deleting} style={[styles.deleteButton, (!deletePassword || deleting) && { opacity: 0.5 }]} onPress={async () => {
            setDeleting(true);
            try { await authApi.deleteAccount(deletePassword); await logout(); router.replace('/auth/signup'); }
            catch (error) { Alert.alert('Could not delete account', (error as Error).message); }
            finally { setDeleting(false); }
          }}><Text style={styles.deleteButtonText}>{deleting ? 'Deleting…' : 'Delete permanently'}</Text></TouchableOpacity><TouchableOpacity style={styles.cancelDelete} onPress={() => { setShowDelete(false); setDeletePassword(''); }}><Text style={styles.outlineBtnText}>Cancel</Text></TouchableOpacity></View>
        </View>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  hint: { fontSize: 15, color: '#6B7280' },
  btn: { backgroundColor: '#BE5B8E', paddingHorizontal: 20, paddingVertical: 11, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  outlineBtn: { borderWidth: 1.5, borderColor: '#BE5B8E', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12, alignItems: 'center' },
  outlineBtnText: { color: '#BE5B8E', fontWeight: '700', fontSize: 13 },
  header: { alignItems: 'center', padding: 20, paddingBottom: 8 },
  name: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 10 },
  uname: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  bio: { fontSize: 13, color: '#374151', textAlign: 'center', marginTop: 4, paddingHorizontal: 20, lineHeight: 18 },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  pointsNum: { fontSize: 22, fontWeight: '800', color: '#BE5B8E' },
  pointsLabel: { fontSize: 12, color: '#9CA3AF' },
  lumenMark: { fontSize: 17, color: '#BE5B8E', fontWeight: '700' },
  qrContainer: { alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 14, marginTop: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  qrHint: { fontSize: 11, color: '#9CA3AF', marginTop: 8 },
  label: { fontSize: 11, fontWeight: '600', color: '#6B7280', marginBottom: 4, marginTop: 4 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, color: '#111827', backgroundColor: '#fff', width: '100%' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginTop: 16 },
  tab: { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#BE5B8E' },
  tabText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  tabTextActive: { fontWeight: '700', color: '#BE5B8E' },
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  cardUser: { fontSize: 13, fontWeight: '600', color: '#374151' },
  cardTime: { fontSize: 11, color: '#9CA3AF', marginLeft: 'auto' },
  cardMsg: { fontSize: 15, color: '#111827', lineHeight: 22 },
  empty: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, marginTop: 40 },
  accountSection: { margin: 12, marginTop: 28, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  accountTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  legalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 12 },
  legalLink: { color: '#6D5BFF', fontSize: 12, fontWeight: '600' },
  deleteOutline: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#DC6B75', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, marginTop: 18 },
  deleteText: { color: '#B4232E', fontSize: 12, fontWeight: '700' },
  deletePanel: { marginTop: 18, borderWidth: 1, borderColor: '#F0B9BE', backgroundColor: '#FFF7F7', borderRadius: 14, padding: 14 },
  deleteTitle: { color: '#111827', fontSize: 14, fontWeight: '700' }, deleteCopy: { color: '#6B7280', fontSize: 12, lineHeight: 18, marginTop: 4, marginBottom: 12 },
  deleteActions: { flexDirection: 'row', gap: 8, marginTop: 10 }, deleteButton: { backgroundColor: '#B4232E', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10 }, deleteButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' }, cancelDelete: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10 },
});
