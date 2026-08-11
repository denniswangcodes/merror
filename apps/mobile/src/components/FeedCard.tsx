import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { useAppTheme } from '../lib/theme';
import { formatReflectionDate, type FeedbackItem, type PublicUser } from '@merror/shared';

type FeedCardProps = {
  item: FeedbackItem & {
    giver?: Pick<PublicUser, 'id' | 'displayName' | 'username' | 'avatarUrl'>;
    receiver?: Pick<PublicUser, 'id' | 'displayName' | 'username' | 'avatarUrl'>;
  };
  onGiverPress?: () => void;
  onReceiverPress?: () => void;
  onReport?: () => void;
  onShare?: () => void;
};

const TYPE_DEFAULT_IMAGE: Record<FeedbackItem['type'], string> = {
  COMPLIMENT: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=85',
  HELPFUL_ACT: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&auto=format&fit=crop&q=85',
  MEMORY: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=85',
  ENCOURAGEMENT: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=85',
  COMMUNITY_SERVICE: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&auto=format&fit=crop&q=85',
  ENVIRONMENTAL_ACT: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=85',
};

export function FeedCard({ item, onGiverPress, onReceiverPress, onReport, onShare }: FeedCardProps) {
  const theme = useAppTheme();
  const giver = item.giver;
  const receiver = item.receiver;
  const imageUrl = item.imageUrl || TYPE_DEFAULT_IMAGE[item.type];

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.photoWrap}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.photoBadge}><Badge type={item.type} /></View>
      </View>
      <View style={styles.body}>
        <View style={styles.header}>
          {giver && (
            <TouchableOpacity style={styles.userRow} onPress={onGiverPress} disabled={!onGiverPress} activeOpacity={0.7}>
              <Avatar displayName={giver.displayName} username={giver.username} size={28} />
              <Text numberOfLines={1} style={[styles.username, { color: theme.text }]}>{giver.displayName || giver.username}</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.arrow, { color: theme.muted }]}>→</Text>
          {receiver && (
            <TouchableOpacity style={styles.userRow} onPress={onReceiverPress} disabled={!onReceiverPress} activeOpacity={0.7}>
              <Avatar displayName={receiver.displayName} username={receiver.username} size={28} />
              <Text numberOfLines={1} style={[styles.username, { color: theme.text }]}>{receiver.displayName || receiver.username}</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.time, { color: theme.muted }]}>{formatReflectionDate(item.createdAt)}</Text>
        </View>
        <View style={styles.meta}><Text style={[styles.quote, { color: theme.accent }]}>”</Text></View>
        <Text style={[styles.message, { color: theme.text }]}>{item.message}</Text>
        <View style={styles.actions}>{onShare && <TouchableOpacity onPress={onShare} accessibilityLabel="Share reflection" style={styles.reportButton}><Text style={[styles.report, { color: theme.accent }]}>Share</Text></TouchableOpacity>}{onReport && <TouchableOpacity onPress={onReport} accessibilityLabel="Report reflection" style={styles.reportButton}><Text style={[styles.report, { color: theme.muted }]}>Report</Text></TouchableOpacity>}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, marginBottom: 12, marginHorizontal: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  photoWrap: { position: 'relative', margin: 10, marginBottom: 0 },
  image: { width: '100%', aspectRatio: 16 / 9, borderRadius: 12 },
  photoBadge: { position: 'absolute', left: 12, top: 12 },
  body: { paddingHorizontal: 18, paddingTop: 17, paddingBottom: 22, minHeight: 154 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 6 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  username: { fontSize: 13, fontWeight: '700', flexShrink: 1 },
  arrow: { fontSize: 13, marginHorizontal: 1 },
  time: { fontSize: 10, fontWeight: '600', marginLeft: 'auto' },
  meta: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 4 },
  quote: { fontSize: 28, fontWeight: '900', opacity: 0.22, lineHeight: 28 },
  message: { fontSize: 15, fontWeight: '500', lineHeight: 23 },
  reportButton: { alignSelf: 'flex-end', marginTop: 10, paddingVertical: 3 },
  actions: { flexDirection: 'row', alignSelf: 'flex-end', gap: 16 },
  report: { fontSize: 11, fontWeight: '600' },
});
