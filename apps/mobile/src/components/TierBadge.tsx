import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getTier } from '@merror/shared';
import { useAppTheme } from '../lib/theme';

const TIER_MARK = {
  'first-light': '✦',
  'bright-spark': 'ϟ',
  beacon: '☀',
  luminary: '◆',
} as const;

export function TierBadge({ points }: { points: number }) {
  const tier = getTier(points);
  const theme = useAppTheme();
  const color = theme.dark ? tier.darkColor ?? tier.color : tier.color;
  const background = theme.dark ? tier.darkBg ?? tier.mobileBg : tier.mobileBg;
  const border = theme.dark ? tier.darkBorder ?? tier.border : tier.border;
  return (
    <View style={[styles.badge, { backgroundColor: background.startsWith('linear-gradient') ? tier.mobileBg : background, borderColor: border }]}>
      <View style={[styles.mark, { backgroundColor: `${color}18` }]}>
        <Text style={[styles.markText, { color }]}>{TIER_MARK[tier.id]}</Text>
      </View>
      <Text style={[styles.text, { color }]}>{tier.label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 5, paddingRight: 9,
    paddingVertical: 4, borderRadius: 8, borderWidth: 1,
  },
  mark: { width: 17, height: 17, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  markText: { fontSize: 10, fontWeight: '900' },
  text: { fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
});
