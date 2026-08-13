import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Avatar } from '../../src/components/Avatar';
import { GradientButton } from '../../src/components/GradientButton';
import { feedbackApi, notificationsApi } from '../../src/lib/api';
import { useNotifications } from '../../src/context/notifications.context';
import { useAppTheme } from '../../src/lib/theme';
import { formatReflectionDate, type NotificationItem } from '@merror/shared';

function copyFor(item: NotificationItem): string {
  const name = item.fromUser?.displayName || item.fromUser?.username || 'Someone';
  switch (item.type) {
    case 'FRIEND_REQUEST': return `${name} sent you a friend request`;
    case 'FRIEND_ACCEPTED': return `${name} accepted your friend request`;
    case 'FEEDBACK_APPROVED': return `${name} approved your reflection`;
    case 'FEEDBACK_REJECTED': return `${name} declined your reflection`;
    case 'FEEDBACK_LIKED': return `${name} liked your reflection`;
    case 'FEEDBACK_COMMENTED': return `${name} commented on your reflection`;
    default: return `${name} sent you a reflection to review`;
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { refresh: refreshBadges } = useNotifications();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await notificationsApi.getAll() as NotificationItem[];
      setItems(data);
    } catch { /* noop */ }
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openNotification = async (item: NotificationItem) => {
    if (!item.read) {
      notificationsApi.markRead(item.id).then(refreshBadges).catch(() => {});
      setItems((current) => current.map((i) => (i.id === item.id ? { ...i, read: true } : i)));
    }
    if (item.type === 'FRIEND_REQUEST') router.push('/(tabs)/friends');
  };

  const review = async (item: NotificationItem, approve: boolean) => {
    if (!item.referenceId) return;
    setReviewing(item.id);
    try {
      await (approve ? feedbackApi.approve(item.referenceId) : feedbackApi.reject(item.referenceId));
      await load();
      await refreshBadges();
    } finally {
      setReviewing(null);
    }
  };

  const removeOne = (id: string) => {
    notificationsApi.remove(id).catch(() => {});
    setItems((current) => current.filter((i) => i.id !== id));
  };

  const clearAll = () => {
    Alert.alert('Clear all notifications?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear all', style: 'destructive', onPress: async () => { await notificationsApi.clearAll().catch(() => {}); setItems([]); } },
    ]);
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead().catch(() => {});
    setItems((current) => current.map((i) => ({ ...i, read: true })));
    refreshBadges();
  };

  const unreadCount = items.filter((i) => !i.read).length;

  if (loading) return <View style={[styles.center, { backgroundColor: theme.background }]}><ActivityIndicator color={theme.accent} /></View>;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {items.length > 0 && (
        <View style={styles.actionsRow}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllRead}><Text style={[styles.actionText, { color: theme.accent }]}>Mark all read</Text></TouchableOpacity>
          )}
          <TouchableOpacity onPress={clearAll} style={{ marginLeft: 'auto' }}><Text style={[styles.actionText, { color: theme.muted }]}>Clear all</Text></TouchableOpacity>
        </View>
      )}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={<Text style={[styles.empty, { color: theme.muted }]}>You're all caught up.</Text>}
        renderItem={({ item }) => {
          const isReview = item.type === 'FEEDBACK_RECEIVED' && !item.read;
          return (
            <TouchableOpacity
              onPress={() => openNotification(item)}
              style={[styles.card, { backgroundColor: item.read ? theme.surface : `${theme.accent}14`, borderColor: theme.border }]}
            >
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Avatar displayName={item.fromUser?.displayName ?? null} username={item.fromUser?.username ?? '?'} avatarUrl={item.fromUser?.avatarUrl} size={38} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.copy, { color: theme.text }]}>{copyFor(item)}</Text>
                  {isReview && item.feedback && (
                    <View style={[styles.quote, { backgroundColor: theme.background, borderColor: theme.border }]}>
                      <Text style={[styles.quoteText, { color: theme.textSecondary }]} numberOfLines={3}>&ldquo;{item.feedback.message}&rdquo;</Text>
                    </View>
                  )}
                  <Text style={[styles.time, { color: theme.muted }]}>{formatReflectionDate(item.createdAt)}</Text>
                </View>
                {!item.read && <View style={[styles.dot, { backgroundColor: theme.accent }]} />}
                <TouchableOpacity onPress={() => removeOne(item.id)} hitSlop={8} style={{ padding: 2 }}>
                  <Text style={{ color: theme.muted, fontSize: 14 }}>✕</Text>
                </TouchableOpacity>
              </View>
              {isReview && (
                <View style={styles.reviewRow}>
                  <GradientButton style={styles.approveBtn} disabled={reviewing === item.id} onPress={() => review(item, true)} label="Approve" textStyle={styles.approveText} />
                  <TouchableOpacity disabled={reviewing === item.id} style={[styles.rejectBtn, { borderColor: theme.border }]} onPress={() => review(item, false)}>
                    <Text style={[styles.rejectText, { color: theme.textSecondary }]}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 2 },
  actionText: { fontSize: 12, fontWeight: '700' },
  empty: { textAlign: 'center', fontSize: 14, marginTop: 60 },
  card: { borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 8 },
  copy: { fontSize: 13, lineHeight: 18 },
  quote: { marginTop: 6, borderRadius: 10, borderWidth: 1, padding: 8 },
  quoteText: { fontSize: 12, lineHeight: 17 },
  time: { fontSize: 10, fontWeight: '600', marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  reviewRow: { flexDirection: 'row', gap: 8, marginTop: 10, marginLeft: 48 },
  approveBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  approveText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  rejectBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  rejectText: { fontWeight: '700', fontSize: 12 },
});
