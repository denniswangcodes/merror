import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Avatar } from '../../src/components/Avatar';
import { useAuth } from '../../src/context/auth.context';
import { friendsApi } from '../../src/lib/api';
import type { FriendshipItem, PublicUser } from '@merror/shared';

type FUsr = Pick<PublicUser, 'id' | 'displayName' | 'username' | 'avatarUrl' | 'totalPoints'>;
type FriendshipWithUsers = FriendshipItem & { userA?: FUsr; userB?: FUsr };

export default function FriendsScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
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
  };

  const handleDecline = async (id: string) => {
    await friendsApi.remove(id);
    setPending((prev) => prev.filter((f) => f.id !== id));
  };

  const getFriendUser = (f: FriendshipWithUsers): FUsr | null => {
    if (!user) return null;
    return f.userA?.id === user.id ? f.userB || null : f.userA || null;
  };

  if (authLoading) return <View style={styles.center}><ActivityIndicator color="#4F46E5" /></View>;

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.hint}>Sign in to see your friends</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor="#4F46E5" />
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {(['friends', 'pending'] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'friends' ? `Friends (${friends.length})` : `Requests${pending.length > 0 ? ` (${pending.length})` : ''}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#4F46E5" style={{ marginTop: 40 }} />
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
                style={styles.card}
                onPress={() => router.push(`/profile/${f.username}`)}
              >
                <Avatar displayName={f.displayName} username={f.username} size={44} />
                <View style={styles.userInfo}>
                  <Text style={styles.name}>{f.displayName || f.username}</Text>
                  <Text style={styles.uname}>@{f.username}</Text>
                </View>
                <Text style={styles.points}>{f.totalPoints} pts</Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>No friends yet. Scan a QR code!</Text>}
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
              <View style={styles.card}>
                <Avatar displayName={requester.displayName} username={requester.username} size={44} />
                <View style={styles.userInfo}>
                  <Text style={styles.name}>{requester.displayName || requester.username}</Text>
                  <Text style={styles.uname}>@{requester.username}</Text>
                </View>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.id)}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.declineBtn} onPress={() => handleDecline(item.id)}>
                  <Text style={{ color: '#374151', fontWeight: '700', fontSize: 12 }}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>No pending requests</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF9' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  hint: { fontSize: 15, color: '#6B7280' },
  btn: { backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '700' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#4F46E5' },
  tabText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  tabTextActive: { fontWeight: '700', color: '#4F46E5' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  userInfo: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  uname: { fontSize: 12, color: '#6B7280' },
  points: { fontSize: 13, fontWeight: '700', color: '#4F46E5' },
  empty: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, marginTop: 60 },
  acceptBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  declineBtn: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
});
