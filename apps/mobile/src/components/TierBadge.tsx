import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getTier } from '@merror/shared';
import { useAppTheme } from '../lib/theme';

export function TierBadge({ points, onPress }: { points: number; onPress?: () => void }) {
  const tier = getTier(points);
  const theme = useAppTheme();
  const color = theme.dark ? tier.darkColor ?? tier.color : tier.color;
  const background = theme.dark ? tier.darkBg ?? tier.mobileBg : tier.mobileBg;
  const border = theme.dark ? tier.darkBorder ?? tier.border : tier.border;
  const content = (
    <View style={[styles.badge, { backgroundColor: background, borderColor: border }]}> 
      <Text style={[styles.text, { color }]}>{tier.label.toUpperCase()}</Text>
    </View>
  );
  return onPress ? <TouchableOpacity onPress={onPress} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={`View lumen levels. Current level: ${tier.label}`}>{content}</TouchableOpacity> : content;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 11,
    paddingVertical: 6, borderRadius: 6, borderWidth: 1,
  },
  text: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
});
