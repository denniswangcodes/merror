import React, { useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, RefreshControl, Alert, Share } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { FeedCard } from '../../src/components/FeedCard';
import { feedbackApi, safetyApi } from '../../src/lib/api';
import type { FeedbackItem, PaginatedResponse } from '@merror/shared';
import { useAppTheme } from '../../src/lib/theme';

export default function FeedScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (p: number, reset: boolean) => {
    if (p === 1) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await feedbackApi.getFeed(p) as PaginatedResponse<FeedbackItem>;
      setItems((prev) => reset ? res.data : [...prev, ...res.data]);
      setHasMore(res.hasMore);
      setPage(p);
    } catch { /* noop */ }
    if (p === 1) setRefreshing(false);
    else setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(1, true); }, [load]));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FeedCard
            item={item}
            onGiverPress={item.giver ? () => router.push(`/profile/${item.giver!.username}`) : undefined}
            onReceiverPress={item.receiver ? () => router.push(`/profile/${item.receiver!.username}`) : undefined}
            onReport={() => Alert.alert('Report reflection', 'Send this reflection to Merror for safety review?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Report', style: 'destructive', onPress: () => safetyApi.report({ feedbackId: item.id, reportedUserId: item.giver?.id, reason: 'OTHER' }).then(() => Alert.alert('Report submitted', 'Thank you for helping keep Merror safe.')).catch((error) => Alert.alert('Could not report', (error as Error).message)) }])}
            onShare={() => Share.share({ message: `${item.giver?.displayName || item.giver?.username || 'Someone'} recognized ${item.receiver?.displayName || item.receiver?.username || 'someone'} on Merror: “${item.message}”` })}
          />
        )}
        contentContainerStyle={{ paddingVertical: 16 }}
        onEndReached={() => { if (hasMore && !loading) load(page + 1, false); }}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(1, true)} tintColor={theme.accent} />
        }
        ListEmptyComponent={
          !refreshing ? (
            <View style={styles.emptyWrap}><Text style={[styles.emptyTitle, { color: theme.text }]}>Start the good</Text><Text style={[styles.empty, { color: theme.muted }]}>Recognize someone for a moment that mattered.</Text></View>
          ) : null
        }
        ListFooterComponent={loading ? <ActivityIndicator color={theme.accent} style={{ marginVertical: 16 }} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF9' },
  emptyWrap: { alignItems: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyTitle: { textAlign: 'center', fontSize: 17, fontWeight: '800', marginBottom: 5 },
  empty: { textAlign: 'center', fontSize: 14, lineHeight: 20 },
});
