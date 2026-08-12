import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatReflectionDate, MAX_REFLECTION_IMAGE_CHARS, type FeedbackItem } from '@merror/shared';
import { Badge } from './Badge';
import { feedbackApi } from '../lib/api';
import { compressToDataUrl, pickImage, showImageSourceSheet } from '../lib/image';
import { useAppTheme } from '../lib/theme';

const DEFAULT_IMAGE: Record<FeedbackItem['type'], string> = {
  COMPLIMENT: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=85',
  HELPFUL_ACT: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&auto=format&fit=crop&q=85',
  MEMORY: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=85',
  ENCOURAGEMENT: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=85',
  COMMUNITY_SERVICE: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&auto=format&fit=crop&q=85',
  ENVIRONMENTAL_ACT: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=85',
};

interface ProfileReflectionCardProps {
  item: FeedbackItem;
  personLabel?: string | null;
  canDelete?: boolean;
  canEditPhoto?: boolean;
  onDelete?: () => void;
  onPhotoChanged?: (imageUrl: string | null) => void;
}

export function ProfileReflectionCard({ item, personLabel, canDelete, canEditPhoto, onDelete, onPhotoChanged }: ProfileReflectionCardProps) {
  const theme = useAppTheme();
  const [currentImageUrl, setCurrentImageUrl] = useState(item.imageUrl ?? null);
  const [updatingPhoto, setUpdatingPhoto] = useState(false);

  const applyPhoto = async (dataUrl: string | null) => {
    setUpdatingPhoto(true);
    try {
      await feedbackApi.update(item.id, { imageUrl: dataUrl });
      setCurrentImageUrl(dataUrl);
      onPhotoChanged?.(dataUrl);
    } catch (error) {
      Alert.alert('Could not update photo', (error as Error).message);
    } finally {
      setUpdatingPhoto(false);
    }
  };
  const pickAndApplyPhoto = () => showImageSourceSheet(async (source) => {
    const uri = await pickImage(source, [4, 5]);
    if (!uri) return;
    await applyPhoto(await compressToDataUrl(uri, { maxChars: MAX_REFLECTION_IMAGE_CHARS }));
  });
  const editPhoto = () => {
    if (currentImageUrl) {
      Alert.alert('Edit photo', undefined, [
        { text: 'Replace photo', onPress: pickAndApplyPhoto },
        { text: 'Remove photo', style: 'destructive', onPress: () => applyPhoto(null) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      pickAndApplyPhoto();
    }
  };
  const confirmDelete = () => {
    Alert.alert('Delete reflection?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await feedbackApi.remove(item.id); onDelete?.(); } catch (error) { Alert.alert('Could not delete', (error as Error).message); }
      } },
    ]);
  };
  const openOptions = () => {
    const buttons: Array<{ text: string; style?: 'destructive' | 'cancel'; onPress?: () => void }> = [];
    if (canEditPhoto) buttons.push({ text: 'Edit photo', onPress: editPhoto });
    if (canDelete) buttons.push({ text: 'Delete', style: 'destructive', onPress: confirmDelete });
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Reflection options', undefined, buttons);
  };

  return <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
    <View>
      <Image source={{ uri: currentImageUrl || DEFAULT_IMAGE[item.type] }} style={styles.image} resizeMode="cover" />
      {updatingPhoto && <View style={styles.photoOverlay}><ActivityIndicator color="#fff" /></View>}
      {(canEditPhoto || canDelete) && <TouchableOpacity style={styles.optionsButton} onPress={openOptions} accessibilityLabel="Reflection options"><Ionicons name="ellipsis-horizontal" size={18} color="#fff" /></TouchableOpacity>}
    </View>
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
  photoOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.35)' },
  optionsButton: { position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  body: { padding: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  person: { flex: 1, fontSize: 13, fontWeight: '800' },
  time: { fontSize: 10, fontWeight: '600' },
  badge: { marginTop: 9, alignSelf: 'flex-start' },
  message: { fontSize: 15, lineHeight: 22, marginTop: 9 },
});
