import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar } from '../../src/components/Avatar';
import { ProfileReflectionCard } from '../../src/components/ProfileReflectionCard';
import { TierBadge } from '../../src/components/TierBadge';
import { useAuth } from '../../src/context/auth.context';
import { friendsApi, safetyApi, usersApi } from '../../src/lib/api';
import { useAppTheme } from '../../src/lib/theme';
import type { FeedbackItem, FriendshipItem, PublicUser } from '@merror/shared';

type Profile = PublicUser & { feedbackReceived?: FeedbackItem[]; feedbackGiven?: FeedbackItem[] };
type Friendship = FriendshipItem & { userA?: Pick<PublicUser, 'id'>; userB?: Pick<PublicUser, 'id'> };

export default function PublicProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter(); const theme = useAppTheme(); const { user: me } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null); const [friendship, setFriendship] = useState<Friendship | null>(null);
  const [tab, setTab] = useState<'received' | 'given'>('received'); const [refreshing, setRefreshing] = useState(false); const [menu, setMenu] = useState(false); const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    if (!username) return;
    try {
      const [person, relationships] = await Promise.all([usersApi.getByUsername(username), me ? friendsApi.getFriends() : Promise.resolve([])]);
      const next = person as Profile; setProfile(next);
      setFriendship(((relationships as Friendship[]).find((item) => item.userAId === next.id || item.userBId === next.id)) ?? null);
    } catch { router.back(); }
  }, [username, me, router]);
  useEffect(() => { void load(); }, [load]);
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  if (!profile) return <View style={[styles.center, { backgroundColor: theme.background }]}><ActivityIndicator color={theme.accent} /></View>;
  const received = profile.feedbackReceived ?? []; const given = profile.feedbackGiven ?? []; const items = tab === 'received' ? received : given;
  const changeFriendship = async () => {
    setBusy(true);
    try {
      if (friendship) { await friendsApi.remove(friendship.id); setFriendship(null); }
      else { await friendsApi.sendRequest(profile.id); Alert.alert('Request sent', `Friend request sent to ${profile.displayName || profile.username}.`); }
    } catch (error) { Alert.alert('Could not update friendship', (error as Error).message); }
    finally { setBusy(false); }
  };
  const openSafety = () => { setMenu(false); Alert.alert('Profile options', undefined, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Report account', onPress: () => safetyApi.report({ reportedUserId: profile.id, reason: 'OTHER' }).then(() => Alert.alert('Report submitted')) },
    { text: 'Block account', style: 'destructive', onPress: () => safetyApi.block(profile.id).then(() => router.replace('/(tabs)/feed')).catch((error) => Alert.alert('Could not block', (error as Error).message)) },
  ]); };
  return <View style={{ flex: 1, backgroundColor: theme.background }}>
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.accent} />} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.more} onPress={() => setMenu(true)} accessibilityLabel="More profile options"><Ionicons name="ellipsis-horizontal" size={25} color={theme.text} /></TouchableOpacity>
        <Avatar displayName={profile.displayName} username={profile.username} avatarUrl={profile.avatarUrl} size={80} />
        <Text style={[styles.name, { color: theme.text }]}>{profile.displayName || profile.username}</Text>
        <Text style={[styles.uname, { color: theme.muted }]}>@{profile.username}</Text>
        {profile.bio ? <Text style={[styles.bio, { color: theme.textSecondary }]}>{profile.bio}</Text> : null}
        <View style={styles.points}><Text style={[styles.pointsNum, { color: theme.text }]}>{profile.totalPoints}</Text><Text style={[styles.lumens, { color: theme.muted }]}>Lumens</Text><TierBadge points={profile.totalPoints} onPress={() => router.push('/points')} /></View>
        {me && me.id !== profile.id && <View style={styles.actions}>
          <TouchableOpacity style={[styles.primary, { backgroundColor: theme.accent }]} onPress={() => router.push(`/give/${profile.id}`)}><Text style={styles.primaryText}>Reflect</Text></TouchableOpacity>
          <TouchableOpacity disabled={busy} style={[styles.secondary, { backgroundColor: theme.surface, borderColor: theme.borderStrong }]} onPress={changeFriendship}><Text style={[styles.secondaryText, { color: friendship ? '#D95B68' : theme.text }]}>{friendship ? 'Unfriend' : 'Add Friend'}</Text></TouchableOpacity>
        </View>}
      </View>
      <View style={[styles.tabs, { borderBottomColor: theme.border }]}>{(['received', 'given'] as const).map((value) => <TouchableOpacity key={value} style={[styles.tab, tab === value && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]} onPress={() => setTab(value)}><Text style={[styles.tabText, { color: tab === value ? theme.text : theme.muted }]}>{value === 'received' ? `Received (${received.length})` : `Given (${given.length})`}</Text></TouchableOpacity>)}</View>
      <View style={styles.list}>{items.length ? items.map((item) => { const other = tab === 'received' ? item.giver : item.receiver; return <ProfileReflectionCard key={item.id} item={item} personLabel={other?.displayName || other?.username} />; }) : <Text style={[styles.empty, { color: theme.muted }]}>No public {tab} reflections yet</Text>}</View>
    </ScrollView>
    <Modal visible={menu} transparent animationType="fade" onRequestClose={() => setMenu(false)}><TouchableOpacity activeOpacity={1} style={styles.backdrop} onPress={() => setMenu(false)}><View style={[styles.sheet, { backgroundColor: theme.raised, borderColor: theme.border }]}><TouchableOpacity style={styles.sheetItem} onPress={openSafety}><Ionicons name="shield-outline" size={20} color={theme.textSecondary} /><Text style={[styles.sheetText, { color: theme.text }]}>Account options</Text></TouchableOpacity><TouchableOpacity style={styles.sheetItem} onPress={() => setMenu(false)}><Ionicons name="close" size={20} color={theme.muted} /><Text style={[styles.sheetText, { color: theme.muted }]}>Cancel</Text></TouchableOpacity></View></TouchableOpacity></Modal>
  </View>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' }, header: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8, position: 'relative' }, more: { position: 'absolute', right: 16, top: 12, padding: 8, zIndex: 2 }, name: { fontSize: 21, fontWeight: '800', marginTop: 10 }, uname: { fontSize: 13, marginTop: 1 }, bio: { fontSize: 13, textAlign: 'center', lineHeight: 18, marginTop: 8, paddingHorizontal: 20 }, points: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 }, pointsNum: { fontSize: 20, fontWeight: '900' }, lumens: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }, actions: { flexDirection: 'row', width: '100%', gap: 9, marginTop: 16 }, primary: { flex: 1, borderRadius: 9, paddingVertical: 9, alignItems: 'center' }, primaryText: { color: '#fff', fontSize: 13, fontWeight: '800' }, secondary: { flex: 1, borderWidth: 1, borderRadius: 9, paddingVertical: 9, alignItems: 'center' }, secondaryText: { fontSize: 13, fontWeight: '800' }, tabs: { flexDirection: 'row', borderBottomWidth: 1, marginTop: 10 }, tab: { flex: 1, alignItems: 'center', paddingVertical: 13 }, tabText: { fontSize: 14, fontWeight: '800' }, list: { padding: 12 }, empty: { textAlign: 'center', marginTop: 35 }, backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.48)', justifyContent: 'flex-end', padding: 12 }, sheet: { borderRadius: 18, borderWidth: 1, padding: 8, marginBottom: 8 }, sheetItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15 }, sheetText: { fontSize: 15, fontWeight: '700' },
});
