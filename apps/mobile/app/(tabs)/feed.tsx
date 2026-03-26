import React, { useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { FeedCard } from '../../src/components/FeedCard';
import { feedbackApi } from '../../src/lib/api';
import type { FeedbackItem, PaginatedResponse } from '@merror/shared';

export default function FeedScreen() {
  const router = useRouter();
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
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FeedCard
            item={item}
            onGiverPress={item.giver ? () => router.push(`/profile/${item.giver!.username}`) : undefined}
            onReceiverPress={item.receiver ? () => router.push(`/profile/${item.receiver!.username}`) : undefined}
          />
        )}
        contentContainerStyle={{ paddingVertical: 12 }}
        onEndReached={() => { if (hasMore && !loading) load(page + 1, false); }}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(1, true)} tintColor="#4F46E5" />
        }
        ListEmptyComponent={
          !refreshing ? (
            <Text style={styles.empty}>No reflections yet. Be the first!</Text>
          ) : null
        }
        ListFooterComponent={loading ? <ActivityIndicator color="#4F46E5" style={{ marginVertical: 16 }} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF9' },
  empty: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, marginTop: 60, paddingHorizontal: 24 },
});
