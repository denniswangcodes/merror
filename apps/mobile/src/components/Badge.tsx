import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FEEDBACK_TYPE_META } from '@merror/shared';
import type { FeedbackType } from '@merror/shared';

export function Badge({ type }: { type: FeedbackType }) {
  const meta = FEEDBACK_TYPE_META[type];
  return (
    <View style={[styles.badge, { backgroundColor: meta.bg }]}>
      <Text style={[styles.text, { color: meta.textColor }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
