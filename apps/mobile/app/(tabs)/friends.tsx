import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Avatar } from '../../src/components/Avatar';
import { useAuth } from '../../src/context/auth.context';
import { friendsApi } from '../../src/lib/api';
import { useNotifications } from '../../src/context/notifications.context';
import { useAppTheme } from '../../src/lib/theme';
import type { FriendshipItem, PublicUser } from '@merror/shared';

type FUsr = Pick<PublicUser, 'id' | 'displayName' | 'username' | 'avatarUrl' | 'totalPoints'>;
type FriendshipWithUsers = FriendshipItem & { userA?: FUsr; userB?: FUsr };

export default function FriendsScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { user, loading: authLoading } = useAuth();
  const { refresh: refreshNotifications } = useNotifications();
  const [tab, setTab] = useState<'friends' | 'pending'>('friends');
  const [friends, setFriends] = useState<FriendshipWithUsers[]>([]);
  const [pending, setPending] = useState<FriendshipWithUsers[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!user) return;
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const [f, p] = await Promise.all([friendsApi.getFriends(), friendsApi.getPending()]);
      setFriends(f as FriendshipWithUsers[]);
      setPending(p as FriendshipWithUsers[]);
    } catch { /* noop */ }
    if (silent) setRefreshing(false);
    else setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => { loadData(false); }, [loadData]));

  const handleAccept = async (id: string) => {
    await friendsApi.acceptRequest(id);
    const accepted = pending.find((f) => f.id === id);
    if (accepted) {
      setFriends((prev) => [...prev, { ...accepted, status: 'ACCEPTED' }]);
      setPending((prev) => prev.filter((f) => f.id !== id));
    }
    refreshNotifications();
  };

  const handleDecline = async (id: string) => {
    await friendsApi.remove(id);
    setPending((prev) => prev.filter((f) => f.id !== id));
    refreshNotifications();
  };

  const getFriendUser = (f: FriendshipWithUsers): FUsr | null => {
    if (!user) return null;
    return f.userA?.id === user.id ? f.userB || null : f.userA || null;
  };

  if (authLoading) return <View style={[styles.center, { backgroundColor: theme.background }]}><ActivityIndicator color={theme.accent} /></View>;

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.hint, { color: theme.muted }]}>Sign in to see your friends</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.accent }]} onPress={() => router.push('/auth/login')}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={theme.accent} />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: theme.border }]}>
        {(['friends', 'pending'] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && { borderBottomWidth: 2, borderBottomColor: theme.accent }]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, { color: theme.muted }, tab === t && { fontWeight: '700', color: theme.accent }]}>
              {t === 'friends' ? `Friends (${friends.length})` : `Requests${pending.length > 0 ? ` (${pending.length})` : ''}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
      ) : tab === 'friends' ? (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12 }}
          refreshControl={refreshControl}
          renderItem={({ item }) => {
            const f = getFriendUser(item);
            if (!f) return null;
            return (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => router.push(`/profile/${f.username}`)}
              >
                <Avatar displayName={f.displayName} username={f.username} size={44} />
                <View style={styles.userInfo}>
                  <Text style={[styles.name, { color: theme.text }]}>{f.displayName || f.username}</Text>
                  <Text style={[styles.uname, { color: theme.muted }]}>@{f.username}</Text>
                </View>
                <Text style={[styles.points, { color: theme.accent }]}>{f.totalPoints} lumens</Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.muted }]}>No friends yet. Scan a QR code!</Text>}
        />
      ) : (
        <FlatList
          data={pending}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12 }}
          refreshControl={refreshControl}
          renderItem={({ item }) => {
            const requester = item.userA;
            if (!requester) return null;
            return (
              <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Avatar displayName={requester.displayName} username={requester.username} size={44} />
                <View style={styles.userInfo}>
                  <Text style={[styles.name, { color: theme.text }]}>{requester.displayName || requester.username}</Text>
                  <Text style={[styles.uname, { color: theme.muted }]}>@{requester.username}</Text>
                </View>
                <TouchableOpacity style={[styles.acceptBtn, { backgroundColor: theme.accent }]} onPress={() => handleAccept(item.id)}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.declineBtn, { backgroundColor: theme.background }]} onPress={() => handleDecline(item.id)}>
                  <Text style={{ color: theme.textSecondary, fontWeight: '700', fontSize: 12 }}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.muted }]}>No pending requests</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  hint: { fontSize: 15 },
  btn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '700' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '500' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  userInfo: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600' },
  uname: { fontSize: 12 },
  points: { fontSize: 13, fontWeight: '700' },
  empty: { textAlign: 'center', fontSize: 14, marginTop: 60 },
  acceptBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  declineBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
});
