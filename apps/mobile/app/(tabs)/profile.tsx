import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useFocusEffect, useRouter } from 'expo-router';
import { Avatar } from '../../src/components/Avatar';
import { ProfileReflectionCard } from '../../src/components/ProfileReflectionCard';
import { TierBadge } from '../../src/components/TierBadge';
import { useAuth } from '../../src/context/auth.context';
import { feedbackApi, usersApi } from '../../src/lib/api';
import { useAppTheme, useThemeMode } from '../../src/lib/theme';
import type { FeedbackItem, PaginatedResponse } from '@merror/shared';

export default function ProfileScreen() {
  const router = useRouter(); const theme = useAppTheme(); const { mode, toggle } = useThemeMode(); const { user, loading, logout, refreshUser } = useAuth();
  const [received, setReceived] = useState<FeedbackItem[]>([]); const [given, setGiven] = useState<FeedbackItem[]>([]); const [tab, setTab] = useState<'received' | 'given'>('received');
  const [refreshing, setRefreshing] = useState(false); const [menu, setMenu] = useState(false); const [edit, setEdit] = useState(false); const [qr, setQr] = useState(false); const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(''); const [bio, setBio] = useState('');
  const loadFeedback = useCallback(async () => { if (!user) return; await Promise.all([feedbackApi.getReceived().then((r) => setReceived((r as PaginatedResponse<FeedbackItem>).data)), feedbackApi.getGiven().then((r) => setGiven((r as PaginatedResponse<FeedbackItem>).data))]); }, [user]);
  useFocusEffect(useCallback(() => { void loadFeedback(); }, [loadFeedback]));
  useEffect(() => { if (user) { setDisplayName(user.displayName || ''); setBio(user.bio || ''); } }, [user]);
  const refresh = async () => { setRefreshing(true); await Promise.all([refreshUser(), loadFeedback()]); setRefreshing(false); };
  const save = async () => { setSaving(true); try { await usersApi.updateProfile({ displayName, bio }); await refreshUser(); setEdit(false); } catch (error) { Alert.alert('Could not save profile', (error as Error).message); } finally { setSaving(false); } };
  if (loading) return <View style={[styles.center, { backgroundColor: theme.background }]}><ActivityIndicator color={theme.accent} /></View>;
  if (!user) return <View style={[styles.center, { backgroundColor: theme.background }]}><Text style={{ color: theme.muted }}>Sign in to see your profile</Text><TouchableOpacity style={[styles.signIn, { backgroundColor: theme.accent }]} onPress={() => router.push('/auth/login')}><Text style={styles.white}>Sign In</Text></TouchableOpacity></View>;
  const items = tab === 'received' ? received : given;
  return <View style={{ flex: 1, backgroundColor: theme.background }}>
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.accent} />} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.more} onPress={() => setMenu(true)} accessibilityLabel="Profile settings"><Ionicons name="ellipsis-horizontal" size={26} color={theme.text} /></TouchableOpacity>
        <Avatar displayName={user.displayName} username={user.username} avatarUrl={user.avatarUrl} size={82} />
        <Text style={[styles.name, { color: theme.text }]}>{user.displayName || user.username}</Text>
        <Text style={[styles.uname, { color: theme.muted }]}>@{user.username}</Text>
        {user.bio ? <Text style={[styles.bio, { color: theme.textSecondary }]}>{user.bio}</Text> : null}
        <View style={styles.points}><Text style={[styles.pointsNum, { color: theme.text }]}>{user.totalPoints}</Text><Text style={[styles.lumens, { color: theme.muted }]}>Lumens</Text><TierBadge points={user.totalPoints} onPress={() => router.push('/points')} /></View>
      </View>
      <View style={[styles.tabs, { borderBottomColor: theme.border }]}>{(['received', 'given'] as const).map((value) => <TouchableOpacity key={value} style={[styles.tab, tab === value && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]} onPress={() => setTab(value)}><Text style={[styles.tabText, { color: tab === value ? theme.text : theme.muted }]}>{value === 'received' ? `Received (${received.length})` : `Given (${given.length})`}</Text></TouchableOpacity>)}</View>
      <View style={styles.list}>{items.length ? items.map((item) => { const other = tab === 'received' ? item.giver : item.receiver; return <ProfileReflectionCard key={item.id} item={item} personLabel={other?.displayName || other?.username || item.recipientName} />; }) : <Text style={[styles.empty, { color: theme.muted }]}>No {tab} reflections yet</Text>}</View>
    </ScrollView>

    <Modal visible={menu} transparent animationType="fade" onRequestClose={() => setMenu(false)}><TouchableOpacity activeOpacity={1} style={styles.backdrop} onPress={() => setMenu(false)}><View style={[styles.sheet, { backgroundColor: theme.raised, borderColor: theme.border }]}>
      <TouchableOpacity style={styles.menuItem} onPress={() => { setMenu(false); setEdit(true); }}><Ionicons name="create-outline" size={21} color={theme.text} /><Text style={[styles.menuText, { color: theme.text }]}>Edit profile</Text></TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => { setMenu(false); setQr(true); }}><Ionicons name="qr-code-outline" size={21} color={theme.text} /><Text style={[styles.menuText, { color: theme.text }]}>Your Merror code</Text></TouchableOpacity>
      <View style={styles.menuItem}><Ionicons name={mode === 'dark' ? 'moon' : 'sunny-outline'} size={21} color={theme.text} /><Text style={[styles.menuText, { color: theme.text }]}>Dark mode</Text><Switch value={mode === 'dark'} onValueChange={toggle} trackColor={{ false: theme.borderStrong, true: theme.accent }} thumbColor="#fff" /></View>
      <TouchableOpacity style={styles.menuItem} onPress={() => { setMenu(false); Alert.alert('Log out', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log out', style: 'destructive', onPress: logout }]); }}><Ionicons name="log-out-outline" size={21} color="#D95B68" /><Text style={[styles.menuText, { color: '#D95B68' }]}>Log out</Text></TouchableOpacity>
    </View></TouchableOpacity></Modal>

    <Modal visible={edit} transparent animationType="slide" onRequestClose={() => setEdit(false)}><View style={styles.backdrop}><View style={[styles.dialog, { backgroundColor: theme.raised, borderColor: theme.border }]}><View style={styles.dialogHead}><Text style={[styles.dialogTitle, { color: theme.text }]}>Edit profile</Text><TouchableOpacity onPress={() => setEdit(false)}><Ionicons name="close" size={24} color={theme.text} /></TouchableOpacity></View><Text style={[styles.label, { color: theme.muted }]}>Display name</Text><TextInput value={displayName} onChangeText={setDisplayName} maxLength={60} style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]} /><Text style={[styles.label, { color: theme.muted }]}>Bio</Text><TextInput value={bio} onChangeText={setBio} maxLength={200} multiline style={[styles.input, styles.bioInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]} /><TouchableOpacity disabled={saving} style={[styles.save, { backgroundColor: theme.accent }]} onPress={save}><Text style={styles.white}>{saving ? 'Saving…' : 'Save profile'}</Text></TouchableOpacity></View></View></Modal>

    <Modal visible={qr} transparent animationType="fade" onRequestClose={() => setQr(false)}><TouchableOpacity activeOpacity={1} style={[styles.backdrop, { justifyContent: 'center' }]} onPress={() => setQr(false)}><View style={[styles.qrCard, { backgroundColor: theme.raised }]}><View style={styles.qrWhite}><QRCode value={user.qrCode} size={190} /></View><Text style={[styles.qrTitle, { color: theme.text }]}>@{user.username}</Text><Text style={[styles.qrHint, { color: theme.muted }]}>Scan to connect on Merror</Text></View></TouchableOpacity></Modal>
  </View>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }, signIn: { paddingHorizontal: 22, paddingVertical: 11, borderRadius: 10 }, white: { color: '#fff', fontWeight: '800' }, header: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10, position: 'relative' }, more: { position: 'absolute', right: 16, top: 10, padding: 9, zIndex: 2 }, name: { fontSize: 21, fontWeight: '800', marginTop: 10 }, uname: { fontSize: 13, marginTop: 1 }, bio: { fontSize: 13, lineHeight: 18, textAlign: 'center', marginTop: 8, paddingHorizontal: 22 }, points: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 }, pointsNum: { fontSize: 20, fontWeight: '900' }, lumens: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }, tabs: { flexDirection: 'row', borderBottomWidth: 1, marginTop: 8 }, tab: { flex: 1, alignItems: 'center', paddingVertical: 13 }, tabText: { fontSize: 14, fontWeight: '800' }, list: { padding: 12 }, empty: { textAlign: 'center', marginTop: 35 }, backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.52)', justifyContent: 'flex-end', padding: 12 }, sheet: { borderRadius: 18, borderWidth: 1, padding: 8, marginBottom: 8 }, menuItem: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 13 }, menuText: { flex: 1, fontSize: 15, fontWeight: '700' }, dialog: { borderWidth: 1, borderRadius: 20, padding: 18, marginBottom: 8 }, dialogHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }, dialogTitle: { fontSize: 19, fontWeight: '900' }, label: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 5, marginTop: 7 }, input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 }, bioInput: { height: 90, textAlignVertical: 'top' }, save: { alignItems: 'center', borderRadius: 10, paddingVertical: 12, marginTop: 16 }, qrCard: { alignItems: 'center', borderRadius: 20, padding: 24, marginHorizontal: 24 }, qrWhite: { backgroundColor: '#fff', padding: 15, borderRadius: 14 }, qrTitle: { fontSize: 18, fontWeight: '900', marginTop: 16 }, qrHint: { fontSize: 13, marginTop: 3 },
});
