import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { formatReflectionDate, type FeedbackItem } from '@merror/shared';
import { Badge } from './Badge';
import { useAppTheme } from '../lib/theme';

const DEFAULT_IMAGE: Record<FeedbackItem['type'], string> = {
  COMPLIMENT: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=85',
  HELPFUL_ACT: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&auto=format&fit=crop&q=85',
  MEMORY: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=85',
  ENCOURAGEMENT: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=85',
  COMMUNITY_SERVICE: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&auto=format&fit=crop&q=85',
  ENVIRONMENTAL_ACT: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=85',
};

export function ProfileReflectionCard({ item, personLabel }: { item: FeedbackItem; personLabel?: string | null }) {
  const theme = useAppTheme();
  return <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
    <Image source={{ uri: item.imageUrl || DEFAULT_IMAGE[item.type] }} style={styles.image} resizeMode="cover" />
    <View style={styles.body}>
      <View style={styles.header}>{personLabel ? <Text numberOfLines={1} style={[styles.person, { color: theme.text }]}>{personLabel}</Text> : null}<Text style={[styles.time, { color: theme.muted }]}>{formatReflectionDate(item.createdAt)}</Text></View>
      <View style={styles.badge}><Badge type={item.type} /></View>
      <Text style={[styles.message, { color: theme.text }]}>{item.message}</Text>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, marginBottom: 14, overflow: 'hidden' },
  image: { width: '100%', aspectRatio: 4 / 5 },
  body: { padding: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  person: { flex: 1, fontSize: 13, fontWeight: '800' },
  time: { fontSize: 10, fontWeight: '600' },
  badge: { marginTop: 9, alignSelf: 'flex-start' },
  message: { fontSize: 15, lineHeight: 22, marginTop: 9 },
});
