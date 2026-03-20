import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar } from '../../src/components/Avatar';
import { Badge } from '../../src/components/Badge';
import { useAuth } from '../../src/context/auth.context';
import { usersApi, friendsApi } from '../../src/lib/api';
import { getTier, timeAgo } from '@merror/shared';
import type { PublicUser, FeedbackItem } from '@merror/shared';

export default function PublicProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState<PublicUser & {
    feedbackReceived?: FeedbackItem[];
    feedbackGiven?: FeedbackItem[];
  } | null>(null);
  const [tab, setTab] = useState<'received' | 'given'>('received');

  useEffect(() => {
    if (username) usersApi.getByUsername(username).then((u) => setProfile(u as typeof profile)).catch(() => router.back());
  }, [username]);

  if (!profile) return <View style={styles.center}><ActivityIndicator color="#4F46E5" /></View>;

  const tier = getTier(profile.totalPoints);
  const received = (profile.feedbackReceived || []) as FeedbackItem[];
  const given = (profile.feedbackGiven || []) as FeedbackItem[];
  const items = tab === 'received' ? received : given;

  const handleAddFriend = async () => {
    try {
      await friendsApi.sendRequest(profile.id);
      Alert.alert('Request Sent!', `Friend request sent to ${profile.displayName || profile.username}`);
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FAFAF9' }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.header}>
        <Avatar displayName={profile.displayName} username={profile.username} size={72} />
        <Text style={styles.name}>{profile.displayName || profile.username}</Text>
        <Text style={styles.uname}>@{profile.username}</Text>
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        <View style={styles.pointsRow}>
          <Text style={styles.pointsNum}>{profile.totalPoints}</Text>
          <Text style={styles.pointsLabel}>points</Text>
          <View style={[styles.tierBadge, { backgroundColor: tier.bg, borderColor: tier.border }]}>
            <Text style={[styles.tierText, { color: tier.color }]}>{tier.label}</Text>
          </View>
        </View>

        {me && me.id !== profile.id && (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <TouchableOpacity style={styles.btn} onPress={() => router.push(`/give/${profile.id}`)}>
              <Text style={styles.btnText}>Give Feedback</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn} onPress={handleAddFriend}>
              <Text style={styles.outlineBtnText}>Add Friend</Text>
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
          <Text style={styles.empty}>No public {tab} feedback yet</Text>
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
                  <Text style={styles.cardTime}>{timeAgo(item.createdAt)}</Text>
                </View>
                <Text style={styles.cardMsg}>&ldquo;{item.message}&rdquo;</Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', padding: 20, paddingBottom: 8 },
  name: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 10 },
  uname: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  bio: { fontSize: 14, color: '#374151', textAlign: 'center', marginTop: 6, paddingHorizontal: 24 },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  pointsNum: { fontSize: 22, fontWeight: '800', color: '#4F46E5' },
  pointsLabel: { fontSize: 12, color: '#9CA3AF' },
  tierBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  tierText: { fontSize: 11, fontWeight: '700' },
  btn: { backgroundColor: '#4F46E5', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  outlineBtn: { borderWidth: 1.5, borderColor: '#4F46E5', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12, alignItems: 'center' },
  outlineBtnText: { color: '#4F46E5', fontWeight: '700', fontSize: 13 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginTop: 16 },
  tab: { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#4F46E5' },
  tabText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  tabTextActive: { fontWeight: '700', color: '#4F46E5' },
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  cardUser: { fontSize: 13, fontWeight: '600', color: '#374151' },
  cardTime: { fontSize: 11, color: '#9CA3AF', marginLeft: 'auto' },
  cardMsg: { fontSize: 15, color: '#111827', lineHeight: 22 },
  empty: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, marginTop: 40 },
});
