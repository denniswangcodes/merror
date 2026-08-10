import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FEEDBACK_TYPE_META } from '@merror/shared';
import type { FeedbackType } from '@merror/shared';
import { useAppTheme } from '../lib/theme';

export function Badge({ type }: { type: FeedbackType }) {
  const meta = FEEDBACK_TYPE_META[type];
  const theme = useAppTheme();
  const mark = type === 'COMPLIMENT' ? '♥' : type === 'HELPFUL_ACT' ? '✦' : '●';
  return (
    <View style={[styles.badge, { backgroundColor: theme.dark ? meta.darkBg : meta.bg, borderColor: `${theme.dark ? meta.darkColor : meta.color}35` }]}>
      <Text style={[styles.mark, { color: theme.dark ? meta.darkColor : meta.color }]}>{mark}</Text>
      <Text style={[styles.text, { color: theme.dark ? meta.darkTextColor : meta.textColor }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  mark: { fontSize: 10, fontWeight: '900' },
  text: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
