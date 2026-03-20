import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { FeedCard } from '../../src/components/FeedCard';
import { feedbackApi } from '../../src/lib/api';
import type { FeedbackItem, PaginatedResponse } from '@merror/shared';

export default function FeedScreen() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = useCallback(async (p = 1, reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await feedbackApi.getFeed(p) as PaginatedResponse<FeedbackItem>;
      setItems((prev) => reset ? res.data : [...prev, ...res.data]);
      setHasMore(res.hasMore);
      setPage(p);
    } catch { /* noop */ }
    setLoading(false);
  }, [loading]);

  useEffect(() => { loadFeed(1, true); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed(1, true);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedCard item={item} />}
        contentContainerStyle={{ paddingVertical: 12 }}
        onEndReached={() => { if (hasMore && !loading) loadFeed(page + 1); }}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
        ListEmptyComponent={
          loading ? null : (
            <Text style={styles.empty}>No feedback yet. Give someone a compliment!</Text>
          )
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
