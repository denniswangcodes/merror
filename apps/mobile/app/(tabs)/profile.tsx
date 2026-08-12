import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, Share, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useFocusEffect, useRouter } from 'expo-router';
import { Avatar } from '../../src/components/Avatar';
import { ProfileReflectionCard } from '../../src/components/ProfileReflectionCard';
import { TierBadge } from '../../src/components/TierBadge';
import { useAuth } from '../../src/context/auth.context';
import { feedbackApi, usersApi } from '../../src/lib/api';
import { compressToDataUrl, pickImage, showImageSourceSheet } from '../../src/lib/image';
import { useAppTheme, useThemeMode } from '../../src/lib/theme';
import { MAX_AVATAR_IMAGE_CHARS, type FeedbackItem, type PaginatedResponse } from '@merror/shared';

export default function ProfileScreen() {
  const router = useRouter(); const theme = useAppTheme(); const { mode, toggle } = useThemeMode(); const { user, loading, logout, refreshUser, deleteAccount } = useAuth();
  const [received, setReceived] = useState<FeedbackItem[]>([]); const [given, setGiven] = useState<FeedbackItem[]>([]); const [tab, setTab] = useState<'received' | 'given'>('received');
  const [refreshing, setRefreshing] = useState(false); const [menu, setMenu] = useState(false); const [edit, setEdit] = useState(false); const [qr, setQr] = useState(false); const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(''); const [bio, setBio] = useState('');
  // undefined = no pending change, null = pending removal, string = pending new avatar
  const [avatarUri, setAvatarUri] = useState<string | null | undefined>(undefined);
  const [processingAvatar, setProcessingAvatar] = useState(false);
  const [del, setDel] = useState(false); const [delPassword, setDelPassword] = useState(''); const [deleting, setDeleting] = useState(false);
  const loadFeedback = useCallback(async () => { if (!user) return; await Promise.all([feedbackApi.getReceived().then((r) => setReceived((r as PaginatedResponse<FeedbackItem>).data)), feedbackApi.getGiven().then((r) => setGiven((r as PaginatedResponse<FeedbackItem>).data))]); }, [user]);
  useFocusEffect(useCallback(() => { void loadFeedback(); }, [loadFeedback]));
  useEffect(() => { if (user) { setDisplayName(user.displayName || ''); setBio(user.bio || ''); } }, [user]);
  const refresh = async () => { setRefreshing(true); await Promise.all([refreshUser(), loadFeedback()]); setRefreshing(false); };
  const save = async () => { setSaving(true); try { await usersApi.updateProfile({ displayName, bio, ...(avatarUri !== undefined ? { avatarUrl: avatarUri } : {}) }); await refreshUser(); setEdit(false); setAvatarUri(undefined); } catch (error) { Alert.alert('Could not save profile', (error as Error).message); } finally { setSaving(false); } };
  const closeEdit = () => { setEdit(false); setAvatarUri(undefined); };
  const pickAndApplyAvatar = () => showImageSourceSheet(async (source) => {
    const uri = await pickImage(source, [1, 1]);
    if (!uri) return;
    setProcessingAvatar(true);
    try { setAvatarUri(await compressToDataUrl(uri, { maxPx: 512, maxChars: MAX_AVATAR_IMAGE_CHARS })); } finally { setProcessingAvatar(false); }
  });
  const previewAvatarUrl = avatarUri !== undefined ? avatarUri : (user?.avatarUrl ?? null);
  const editAvatar = () => {
    if (previewAvatarUrl) {
      Alert.alert('Profile photo', undefined, [
        { text: 'Replace photo', onPress: pickAndApplyAvatar },
        { text: 'Remove photo', style: 'destructive', onPress: () => setAvatarUri(null) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      pickAndApplyAvatar();
    }
  };
  const profileLink = user ? `https://merror.vercel.app/en/profile/${user.username}` : '';
  const shareProfile = () => Share.share({ message: `Add me on Merror and let's exchange some good vibes — I'm @${user?.username}. ${profileLink}` });
  const confirmDelete = async () => {
    if (!delPassword) { Alert.alert('Password required', 'Enter your password to confirm.'); return; }
    setDeleting(true);
    try { await deleteAccount(delPassword); setDel(false); router.replace('/auth/login'); }
    catch (error) { Alert.alert('Could not delete account', (error as Error).message); }
    finally { setDeleting(false); setDelPassword(''); }
  };
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
      <View style={styles.list}>{items.length ? items.map((item) => {
        const other = tab === 'received' ? item.giver : item.receiver;
        return <ProfileReflectionCard
          key={item.id}
          item={item}
          personLabel={other?.displayName || other?.username || item.recipientName}
          canDelete
          canEditPhoto={user.id === item.giverId}
          onDelete={() => { setReceived((prev) => prev.filter((i) => i.id !== item.id)); setGiven((prev) => prev.filter((i) => i.id !== item.id)); }}
        />;
      }) : <Text style={[styles.empty, { color: theme.muted }]}>No {tab} reflections yet</Text>}</View>
    </ScrollView>

    <Modal visible={menu} transparent animationType="fade" onRequestClose={() => setMenu(false)}><TouchableOpacity activeOpacity={1} style={styles.backdrop} onPress={() => setMenu(false)}><View style={[styles.sheet, { backgroundColor: theme.raised, borderColor: theme.border }]}>
      <TouchableOpacity style={styles.menuItem} onPress={() => { setMenu(false); setEdit(true); }}><Ionicons name="create-outline" size={21} color={theme.text} /><Text style={[styles.menuText, { color: theme.text }]}>Edit profile</Text></TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => { setMenu(false); setQr(true); }}><Ionicons name="qr-code-outline" size={21} color={theme.text} /><Text style={[styles.menuText, { color: theme.text }]}>Share profile</Text></TouchableOpacity>
      <View style={styles.menuItem}><Ionicons name={mode === 'dark' ? 'moon' : 'sunny-outline'} size={21} color={theme.text} /><Text style={[styles.menuText, { color: theme.text }]}>Dark mode</Text><Switch value={mode === 'dark'} onValueChange={toggle} trackColor={{ false: theme.borderStrong, true: theme.accent }} thumbColor="#fff" /></View>
      <TouchableOpacity style={styles.menuItem} onPress={() => { setMenu(false); Alert.alert('Sign out', 'Are you sure you want to sign out?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign Out', style: 'destructive', onPress: logout }]); }}><Ionicons name="log-out-outline" size={21} color="#D95B68" /><Text style={[styles.menuText, { color: '#D95B68' }]}>Sign Out</Text></TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => { setMenu(false); setDel(true); }}><Ionicons name="trash-outline" size={21} color="#D95B68" /><Text style={[styles.menuText, { color: '#D95B68' }]}>Delete account</Text></TouchableOpacity>
    </View></TouchableOpacity></Modal>

    <Modal visible={del} transparent animationType="slide" onRequestClose={() => setDel(false)}><View style={styles.backdrop}><View style={[styles.dialog, { backgroundColor: theme.raised, borderColor: theme.border }]}>
      <View style={styles.dialogHead}><Text style={[styles.dialogTitle, { color: theme.text }]}>Delete account</Text><TouchableOpacity onPress={() => setDel(false)}><Ionicons name="close" size={24} color={theme.text} /></TouchableOpacity></View>
      <Text style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 18 }}>This permanently deletes your account and all associated content. This can&apos;t be undone.</Text>
      <Text style={[styles.label, { color: theme.muted }]}>Confirm password</Text>
      <TextInput value={delPassword} onChangeText={setDelPassword} secureTextEntry placeholder="Password" placeholderTextColor={theme.muted} style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]} />
      <TouchableOpacity disabled={deleting} style={[styles.save, { backgroundColor: '#D95B68' }]} onPress={() => Alert.alert('Delete account', 'Are you sure? This cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: confirmDelete }])}><Text style={styles.white}>{deleting ? 'Deleting…' : 'Delete my account'}</Text></TouchableOpacity>
    </View></View></Modal>

    <Modal visible={edit} transparent animationType="slide" onRequestClose={closeEdit}><View style={styles.backdrop}><View style={[styles.dialog, { backgroundColor: theme.raised, borderColor: theme.border }]}><View style={styles.dialogHead}><Text style={[styles.dialogTitle, { color: theme.text }]}>Edit profile</Text><TouchableOpacity onPress={closeEdit}><Ionicons name="close" size={24} color={theme.text} /></TouchableOpacity></View>
      <View style={styles.avatarEditRow}>
        <View style={styles.avatarEditWrap}>
          <Avatar displayName={user.displayName} username={user.username} avatarUrl={previewAvatarUrl} size={84} />
          {processingAvatar && <View style={[styles.avatarSpinner, { backgroundColor: theme.raised }]}><ActivityIndicator color={theme.accent} size="small" /></View>}
          <TouchableOpacity
            style={[styles.avatarCameraBadge, { backgroundColor: theme.accent, borderColor: theme.raised }]}
            onPress={editAvatar}
            disabled={processingAvatar}
            accessibilityLabel="Change profile photo"
          >
            <Ionicons name="camera" size={15} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.label, { color: theme.muted }]}>Display name</Text><TextInput value={displayName} onChangeText={setDisplayName} maxLength={60} style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]} /><Text style={[styles.label, { color: theme.muted }]}>Bio</Text><TextInput value={bio} onChangeText={setBio} maxLength={200} multiline style={[styles.input, styles.bioInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]} /><TouchableOpacity disabled={saving} style={[styles.save, { backgroundColor: theme.accent }]} onPress={save}><Text style={styles.white}>{saving ? 'Saving…' : 'Save profile'}</Text></TouchableOpacity></View></View></Modal>

    <Modal visible={qr} transparent animationType="fade" onRequestClose={() => setQr(false)}><TouchableOpacity activeOpacity={1} style={[styles.backdrop, { justifyContent: 'center' }]} onPress={() => setQr(false)}><View style={[styles.qrCard, { backgroundColor: theme.raised }]}>
      <View style={styles.qrWhite}><QRCode value={user.qrCode} size={190} /></View>
      <Text style={[styles.qrTitle, { color: theme.text }]}>@{user.username}</Text>
      <Text style={[styles.qrHint, { color: theme.muted }]}>Scan to connect on Merror</Text>
      <View style={[styles.qrLinkRow, { borderColor: theme.border, backgroundColor: theme.background }]}><Text numberOfLines={1} style={[styles.qrLinkText, { color: theme.textSecondary }]}>{profileLink}</Text></View>
      <TouchableOpacity style={[styles.qrShareBtn, { backgroundColor: theme.accent }]} onPress={shareProfile}><Ionicons name="share-outline" size={16} color="#fff" /><Text style={styles.white}>Share link</Text></TouchableOpacity>
    </View></TouchableOpacity></Modal>
  </View>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }, signIn: { paddingHorizontal: 22, paddingVertical: 11, borderRadius: 10 }, white: { color: '#fff', fontWeight: '800' }, header: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10, position: 'relative' }, more: { position: 'absolute', right: 16, top: 10, padding: 9, zIndex: 2 }, name: { fontSize: 21, fontWeight: '800', marginTop: 10 }, uname: { fontSize: 13, marginTop: 1 }, bio: { fontSize: 13, lineHeight: 18, textAlign: 'center', marginTop: 8, paddingHorizontal: 22 }, points: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 }, pointsNum: { fontSize: 20, fontWeight: '900' }, lumens: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }, tabs: { flexDirection: 'row', borderBottomWidth: 1, marginTop: 8 }, tab: { flex: 1, alignItems: 'center', paddingVertical: 13 }, tabText: { fontSize: 14, fontWeight: '800' }, list: { padding: 12 }, empty: { textAlign: 'center', marginTop: 35 }, backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.52)', justifyContent: 'flex-end', padding: 12 }, sheet: { borderRadius: 18, borderWidth: 1, padding: 8, marginBottom: 8 }, menuItem: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 13 }, menuText: { flex: 1, fontSize: 15, fontWeight: '700' }, dialog: { borderWidth: 1, borderRadius: 20, padding: 18, marginBottom: 8 }, dialogHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }, dialogTitle: { fontSize: 19, fontWeight: '900' }, avatarEditRow: { alignItems: 'center', marginBottom: 16 }, avatarEditWrap: { position: 'relative', width: 84, height: 84 }, avatarSpinner: { position: 'absolute', top: 0, left: 0, width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', opacity: 0.85 }, avatarCameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2 }, label: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 5, marginTop: 7 }, input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 }, bioInput: { height: 90, textAlignVertical: 'top' }, save: { alignItems: 'center', borderRadius: 10, paddingVertical: 12, marginTop: 16 }, qrCard: { alignItems: 'center', borderRadius: 20, padding: 24, marginHorizontal: 24 }, qrWhite: { backgroundColor: '#fff', padding: 15, borderRadius: 14 }, qrTitle: { fontSize: 18, fontWeight: '900', marginTop: 16 }, qrHint: { fontSize: 13, marginTop: 3 }, qrLinkRow: { marginTop: 14, width: '100%', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 }, qrLinkText: { fontSize: 12 }, qrShareBtn: { marginTop: 12, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 10, paddingVertical: 11 },
});
