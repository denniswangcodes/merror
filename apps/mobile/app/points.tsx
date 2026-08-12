import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TIERS, getTierProgress } from '@merror/shared';
import { TierBadge } from '../src/components/TierBadge';
import { useAuth } from '../src/context/auth.context';
import { useAppTheme } from '../src/lib/theme';

const descriptions = {
  'first-light': 'Every positive impact starts with a first reflection. This is the beginning of your story.',
  'bright-spark': 'Your kindness is getting noticed. You are creating moments that stay with people.',
  beacon: 'You show up for your community again and again—and your impact shines through.',
  luminary: 'Merror’s highest recognition, earned through a lasting legacy of positive impact.',
} as const;

export default function PointsScreen() {
  const { user } = useAuth();
  const theme = useAppTheme();
  const progress = user ? getTierProgress(user.totalPoints) : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.text }]}>Your impact, recognized.</Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>Every reflection is proof that something you did mattered to someone.</Text>
      {user && progress && (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
          <View style={styles.statusRow}><View><Text style={[styles.eyebrow, { color: theme.muted }]}>YOUR CURRENT STATUS</Text><TierBadge points={user.totalPoints} /></View><Text style={[styles.total, { color: theme.text }]}>{user.totalPoints} <Text style={[styles.totalLabel, { color: theme.muted }]}>lumens</Text></Text></View>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>{progress.tier.tagline}</Text>
          <View style={[styles.track, { backgroundColor: theme.border }]}><View style={[styles.fill, { backgroundColor: theme.accent, width: `${progress.progress}%` }]} /></View>
          <Text style={[styles.progressText, { color: theme.muted }]}>{progress.pointsToNext ? `${progress.pointsToNext} lumens to level up` : 'Top status achieved'}</Text>
        </View>
      )}
      <Text style={[styles.section, { color: theme.muted }]}>HOW LUMENS WORK</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
        {[
          ['sparkles-outline', 'Be recognized', 'Earn one lumen whenever someone records a reflection for you.'],
          ['hand-left-outline', 'Recognize someone', 'Giving a reflection is free and helps someone else rise.'],
          ['infinite-outline', 'Build a lasting record', 'Lumens never expire; they tell the story of your positive impact.'],
        ].map(([icon, title, body]) => <View key={title} style={styles.infoRow}><Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={theme.accent} /><View style={{ flex: 1 }}><Text style={[styles.infoTitle, { color: theme.text }]}>{title}</Text><Text style={[styles.infoBody, { color: theme.muted }]}>{body}</Text></View></View>)}
      </View>
      <Text style={[styles.section, { color: theme.muted }]}>STATUS LEVELS</Text>
      {TIERS.map((tier) => <View key={tier.id} style={[styles.card, styles.tierCard, { backgroundColor: theme.surface, borderColor: theme.border }]}><View style={styles.statusRow}><TierBadge points={tier.minPoints} /><Text style={[styles.range, { color: theme.muted }]}>{tier.nextTierAt ? `${tier.minPoints}–${tier.nextTierAt - 1} lumens` : `${tier.minPoints}+ lumens`}</Text></View><Text style={[styles.infoTitle, { color: theme.text }]}>{tier.tagline}</Text><Text style={[styles.infoBody, { color: theme.muted }]}>{descriptions[tier.id]}</Text></View>)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 40 }, title: { fontSize: 23, fontWeight: '800' }, subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4, marginBottom: 22 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 18 }, statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 7 },
  total: { fontSize: 25, fontWeight: '900' }, totalLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }, tagline: { fontSize: 13, fontWeight: '600', marginTop: 10 }, track: { height: 8, borderRadius: 8, overflow: 'hidden', marginTop: 18 }, fill: { height: 8, borderRadius: 8 }, progressText: { fontSize: 11, fontWeight: '600', textAlign: 'right', marginTop: 7 },
  section: { fontSize: 11, fontWeight: '800', letterSpacing: 1.3, marginBottom: 9 }, infoRow: { flexDirection: 'row', gap: 13, paddingVertical: 9 }, infoTitle: { fontSize: 14, fontWeight: '800' }, infoBody: { fontSize: 13, lineHeight: 19, marginTop: 2 }, tierCard: { marginBottom: 10 }, range: { fontSize: 11, fontWeight: '700' },
});
