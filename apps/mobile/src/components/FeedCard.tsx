import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { timeAgo } from '@merror/shared';
import type { FeedbackItem, PublicUser } from '@merror/shared';

type FeedCardProps = {
  item: FeedbackItem & {
    giver?: Pick<PublicUser, 'id' | 'displayName' | 'username' | 'avatarUrl'>;
    receiver?: Pick<PublicUser, 'id' | 'displayName' | 'username' | 'avatarUrl'>;
  };
  onGiverPress?: () => void;
  onReceiverPress?: () => void;
};

export function FeedCard({ item, onGiverPress, onReceiverPress }: FeedCardProps) {
  const giver = item.giver;
  const receiver = item.receiver;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {giver && (
          <TouchableOpacity style={styles.userRow} onPress={onGiverPress} disabled={!onGiverPress} activeOpacity={0.7}>
            <Avatar displayName={giver.displayName} username={giver.username} size={26} />
            <Text style={styles.username}>{giver.displayName || giver.username}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.arrow}>→</Text>
        {receiver && (
          <TouchableOpacity style={styles.userRow} onPress={onReceiverPress} disabled={!onReceiverPress} activeOpacity={0.7}>
            <Avatar displayName={receiver.displayName} username={receiver.username} size={26} />
            <Text style={styles.username}>{receiver.displayName || receiver.username}</Text>
          </TouchableOpacity>
        )}
        <View style={styles.spacer} />
        <Badge type={item.type} />
      </View>
      <Text style={styles.message}>&ldquo;{item.message}&rdquo;</Text>
      <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 10,
    marginHorizontal: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 4,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  username: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  arrow: {
    fontSize: 13,
    color: '#9CA3AF',
    marginHorizontal: 3,
  },
  spacer: {
    flex: 1,
  },
  message: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
    marginBottom: 8,
  },
  time: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});
