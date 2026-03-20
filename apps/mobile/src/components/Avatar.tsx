import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getAvatarInitials } from '@merror/shared';

interface AvatarProps {
  displayName: string | null | undefined;
  username: string;
  avatarUrl?: string | null;
  size?: number;
}

const COLORS = ['#4F46E5', '#7C3AED', '#DB2777', '#0891B2', '#059669', '#D97706'];

function hashColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function Avatar({ displayName, username, avatarUrl, size = 40 }: AvatarProps) {
  const initials = getAvatarInitials(displayName, username);
  const bg = hashColor(username);

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: '700',
  },
});
