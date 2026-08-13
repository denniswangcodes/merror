import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { FeedbackType, PublicUser } from '@merror/shared';
import { MAX_REFLECTION_IMAGE_CHARS } from '@merror/shared';
import { Avatar } from '../../src/components/Avatar';
import { GradientButton } from '../../src/components/GradientButton';
import { useAuth } from '../../src/context/auth.context';
import { feedbackApi, usersApi } from '../../src/lib/api';
import { compressToDataUrl, pickImage, showImageSourceSheet } from '../../src/lib/image';

const TYPES: { value: FeedbackType; label: string }[] = [
  { value: 'COMPLIMENT', label: 'Kind Word' },
  { value: 'HELPFUL_ACT', label: 'Helping Hand' },
  { value: 'MEMORY', label: 'Shared Moment' },
  { value: 'COMMUNITY_SERVICE', label: 'Community Care' },
];

export default function GiveScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [receiver, setReceiver] = useState<PublicUser | null>(null);
  const [type, setType] = useState<FeedbackType>('COMPLIMENT');
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const addPhoto = () => showImageSourceSheet(async (source) => {
    const uri = await pickImage(source, [4, 5]);
    if (!uri) return;
    setProcessingImage(true);
    try {
      setImagePreview(await compressToDataUrl(uri, { maxChars: MAX_REFLECTION_IMAGE_CHARS }));
    } finally {
      setProcessingImage(false);
    }
  });

  useEffect(() => {
    if (userId) usersApi.getById(userId).then((item) => setReceiver(item as PublicUser)).catch(() => router.back());
  }, [router, userId]);

  const submit = async () => {
    if (!receiver || !message.trim()) return Alert.alert('Message required', 'Write something kind and specific.');
    setSubmitting(true);
    try {
      await feedbackApi.create({ receiverId: receiver.id, type, message: message.trim(), isPublic, ...(imagePreview ? { imageUrl: imagePreview } : {}) });
      Alert.alert('Reflection sent', `${receiver.displayName || receiver.username} can now review it.`, [{ text: 'Done', onPress: () => router.replace('/(tabs)/feed') }]);
    } catch (error) {
      Alert.alert('Could not send', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <View style={styles.center}><Text style={styles.hint}>Sign in to give a reflection</Text><GradientButton style={styles.primary} onPress={() => router.push('/auth/login')} label="Sign in" textStyle={styles.primaryText} /></View>;
  if (!receiver) return <View style={styles.center}><ActivityIndicator color="#6D5BFF" /></View>;

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.receiver}>
      <Avatar displayName={receiver.displayName} username={receiver.username} size={48} />
      <View style={styles.receiverText}><Text style={styles.name}>{receiver.displayName || receiver.username}</Text><Text style={styles.username}>@{receiver.username}</Text></View>
    </View>

    <Text style={styles.label}>What kind of moment is this?</Text>
    <View style={styles.typeRow}>{TYPES.map((item) => <TouchableOpacity key={item.value} style={[styles.typeButton, type === item.value && styles.typeActive]} onPress={() => setType(item.value)}><Text style={[styles.typeText, type === item.value && styles.typeTextActive]}>{item.label}</Text></TouchableOpacity>)}</View>

    <Text style={styles.label}>Your reflection</Text>
    <TextInput style={styles.input} multiline maxLength={280} textAlignVertical="top" value={message} onChangeText={setMessage} placeholder="Write something genuine and specific…" placeholderTextColor="#8A8791" />
    <Text style={styles.count}>{message.length}/280</Text>

    <Text style={styles.label}>Add a photo <Text style={styles.optional}>(optional)</Text></Text>
    {imagePreview ? (
      <View style={styles.photoPreviewWrap}>
        <Image source={{ uri: imagePreview }} style={styles.photoPreview} resizeMode="cover" />
        <TouchableOpacity style={styles.photoChangeBtn} onPress={addPhoto} accessibilityLabel="Change photo"><Ionicons name="image-outline" size={16} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.photoRemoveBtn} onPress={() => setImagePreview(null)} accessibilityLabel="Remove photo"><Ionicons name="close" size={16} color="#fff" /></TouchableOpacity>
      </View>
    ) : (
      <TouchableOpacity style={styles.photoAdd} onPress={addPhoto} disabled={processingImage}>
        {processingImage ? <ActivityIndicator color="#6D5BFF" /> : <><Ionicons name="image-outline" size={18} color="#77727D" /><Text style={styles.photoAddText}>Tap to add a photo</Text></>}
      </TouchableOpacity>
    )}

    <View style={styles.visibility}><View><Text style={styles.visibilityTitle}>Public reflection</Text><Text style={styles.visibilityCopy}>Show this in the community feed</Text></View><Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ false: '#D7D5DB', true: '#A99FFF' }} thumbColor={isPublic ? '#6D5BFF' : '#FFFFFF'} /></View>
    <GradientButton disabled={submitting || !message.trim()} loading={submitting} style={styles.primary} onPress={submit} label="Send reflection" textStyle={styles.primaryText} />
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAFAF9' }, content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 }, hint: { color: '#6D6873', fontSize: 15 },
  receiver: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, borderColor: '#E5E2E8', backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 22 }, receiverText: { marginLeft: 12 }, name: { color: '#19171C', fontWeight: '700', fontSize: 16 }, username: { color: '#77727D', fontSize: 12, marginTop: 2 },
  label: { color: '#403C45', fontSize: 13, fontWeight: '700', marginBottom: 8 }, typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 20 }, typeButton: { width: '48.5%', minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E2E8', borderRadius: 12, paddingHorizontal: 5, backgroundColor: '#FFFFFF' }, typeActive: { borderColor: '#6D5BFF', backgroundColor: '#F1EFFF' }, typeText: { color: '#77727D', fontSize: 11, fontWeight: '600', textAlign: 'center' }, typeTextActive: { color: '#5D4EE8' },
  input: { height: 132, borderWidth: 1, borderColor: '#D7D5DB', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, color: '#19171C', fontSize: 15 }, count: { textAlign: 'right', color: '#8A8791', fontSize: 11, marginTop: 5, marginBottom: 16 },
  optional: { textTransform: 'none', fontWeight: '400', color: '#8A8791' },
  photoAdd: { minHeight: 52, borderWidth: 2, borderStyle: 'dashed', borderColor: '#D7D5DB', borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: 20 }, photoAddText: { color: '#77727D', fontSize: 13, fontWeight: '600' },
  photoPreviewWrap: { position: 'relative', marginBottom: 20, borderRadius: 14, overflow: 'hidden' }, photoPreview: { width: '100%', aspectRatio: 4 / 5, backgroundColor: '#E5E2E8' },
  photoChangeBtn: { position: 'absolute', top: 8, right: 42, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  photoRemoveBtn: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  visibility: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E5E2E8', borderRadius: 14, backgroundColor: '#FFFFFF', padding: 14, marginBottom: 20 }, visibilityTitle: { color: '#19171C', fontSize: 14, fontWeight: '600' }, visibilityCopy: { color: '#8A8791', fontSize: 11, marginTop: 2 },
  primary: { minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }, primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
