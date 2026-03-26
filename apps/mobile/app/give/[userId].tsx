import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Switch, Alert, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar } from '../../src/components/Avatar';
import { useAuth } from '../../src/context/auth.context';
import { usersApi, feedbackApi } from '../../src/lib/api';
import type { PublicUser, FeedbackType } from '@merror/shared';

const TYPES: { value: FeedbackType; label: string; emoji: string }[] = [
  { value: 'COMPLIMENT', label: 'Compliment', emoji: '✨' },
  { value: 'HELPFUL_ACT', label: 'Helpful Act', emoji: '🤝' },
  { value: 'MEMORY', label: 'Memory', emoji: '💜' },
];

export default function GiveScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { user: me } = useAuth();
  const [receiver, setReceiver] = useState<PublicUser | null>(null);
  const [type, setType] = useState<FeedbackType>('COMPLIMENT');
  const [message, setMessage] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userId) usersApi.getById(userId).then((u) => setReceiver(u as PublicUser)).catch(() => router.back());
  }, [userId]);

  if (!me) {
    return (
      <View style={styles.center}>
        <Text style={styles.hint}>Sign in to give feedback</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!receiver) return <View style={styles.center}><ActivityIndicator color="#4F46E5" /></View>;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to add an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri);
    }
  };

  const handleSubmit = async () => {
    if (!message.trim()) { Alert.alert('Required', 'Please write a message.'); return; }
    setSubmitting(true);
    try {
      await feedbackApi.create(receiver.id, type, message.trim(), isPublic, imageUri ?? undefined);
      Alert.alert('Sent! ✨', `Your feedback was sent to ${receiver.displayName || receiver.username}`, [
        { text: 'Awesome!', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
    setSubmitting(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FAFAF9' }} contentContainerStyle={{ padding: 20 }}>
      {/* Receiver card */}
      <View style={styles.receiverCard}>
        <Avatar displayName={receiver.displayName} username={receiver.username} size={50} />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.receiverName}>{receiver.displayName || receiver.username}</Text>
          <Text style={styles.receiverUname}>@{receiver.username}</Text>
        </View>
      </View>

      {/* Type selector */}
      <Text style={styles.label}>What kind of feedback?</Text>
      <View style={styles.typeRow}>
        {TYPES.map((t) => (
          <TouchableOpacity
            key={t.value}
            style={[styles.typeBtn, type === t.value && styles.typeBtnActive]}
            onPress={() => setType(t.value)}
          >
            <Text style={[styles.typeEmoji]}>{t.emoji}</Text>
            <Text style={[styles.typeBtnText, type === t.value && styles.typeBtnTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Message */}
      <Text style={styles.label}>Your message</Text>
      <TextInput
        style={styles.textarea}
        value={message}
        onChangeText={setMessage}
        placeholder="Write something kind and specific..."
        placeholderTextColor="#9CA3AF"
        multiline
        maxLength={280}
        textAlignVertical="top"
      />
      <Text style={styles.charCount}>{message.length}/280</Text>

      {/* Image picker */}
      <Text style={styles.label}>Add a photo <Text style={{ color: '#9CA3AF', fontWeight: '400' }}>(optional)</Text></Text>
      {imageUri ? (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
          <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUri(null)}>
            <Text style={styles.removeImageText}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
          <Text style={styles.imagePickerText}>+ Add Photo</Text>
        </TouchableOpacity>
      )}

      {/* Public toggle */}
      <View style={styles.toggleRow}>
        <View>
          <Text style={styles.toggleLabel}>Make this public</Text>
          <Text style={styles.toggleSub}>Appears on the community feed</Text>
        </View>
        <Switch
          value={isPublic}
          onValueChange={setIsPublic}
          trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
          thumbColor={isPublic ? '#4F46E5' : '#9CA3AF'}
        />
      </View>

      <TouchableOpacity style={[styles.btn, { marginTop: 20 }]} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.btnText}>{submitting ? 'Sending...' : 'Send Feedback ✨'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  hint: { fontSize: 15, color: '#6B7280' },
  btn: { backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  receiverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  receiverName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  receiverUname: { fontSize: 13, color: '#6B7280' },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  typeBtnActive: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  typeEmoji: { fontSize: 18 },
  typeBtnText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  typeBtnTextActive: { color: '#4F46E5' },
  textarea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: '#111827',
    height: 130,
  },
  charCount: { fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginTop: 4, marginBottom: 12 },
  imagePickerBtn: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  imagePickerText: { fontSize: 14, color: '#9CA3AF', fontWeight: '600' },
  imagePreviewContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  imagePreview: { width: '100%', height: 200, borderRadius: 14 },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    justifyContent: 'space-between',
    marginTop: 8,
  },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  toggleSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
});


const TYPES: { value: FeedbackType; label: string; emoji: string }[] = [
  { value: 'COMPLIMENT', label: 'Compliment', emoji: '✨' },
  { value: 'HELPFUL_ACT', label: 'Helpful Act', emoji: '🤝' },
  { value: 'MEMORY', label: 'Memory', emoji: '💜' },
];

export default function GiveScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { user: me } = useAuth();
  const [receiver, setReceiver] = useState<PublicUser | null>(null);
  const [type, setType] = useState<FeedbackType>('COMPLIMENT');
  const [message, setMessage] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userId) usersApi.getById(userId).then((u) => setReceiver(u as PublicUser)).catch(() => router.back());
  }, [userId]);

  if (!me) {
    return (
      <View style={styles.center}>
        <Text style={styles.hint}>Sign in to give feedback</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!receiver) return <View style={styles.center}><ActivityIndicator color="#4F46E5" /></View>;

  const handleSubmit = async () => {
    if (!message.trim()) { Alert.alert('Required', 'Please write a message.'); return; }
    setSubmitting(true);
    try {
      await feedbackApi.create(receiver.id, type, message.trim(), isPublic);
      Alert.alert('Sent! ✨', `Your feedback was sent to ${receiver.displayName || receiver.username}`, [
        { text: 'Awesome!', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
    setSubmitting(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FAFAF9' }} contentContainerStyle={{ padding: 20 }}>
      {/* Receiver card */}
      <View style={styles.receiverCard}>
        <Avatar displayName={receiver.displayName} username={receiver.username} size={50} />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.receiverName}>{receiver.displayName || receiver.username}</Text>
          <Text style={styles.receiverUname}>@{receiver.username}</Text>
        </View>
      </View>

      {/* Type selector */}
      <Text style={styles.label}>What kind of feedback?</Text>
      <View style={styles.typeRow}>
        {TYPES.map((t) => (
          <TouchableOpacity
            key={t.value}
            style={[styles.typeBtn, type === t.value && styles.typeBtnActive]}
            onPress={() => setType(t.value)}
          >
            <Text style={[styles.typeEmoji]}>{t.emoji}</Text>
            <Text style={[styles.typeBtnText, type === t.value && styles.typeBtnTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Message */}
      <Text style={styles.label}>Your message</Text>
      <TextInput
        style={styles.textarea}
        value={message}
        onChangeText={setMessage}
        placeholder="Write something kind and specific..."
        placeholderTextColor="#9CA3AF"
        multiline
        maxLength={280}
        textAlignVertical="top"
      />
      <Text style={styles.charCount}>{message.length}/280</Text>

      {/* Public toggle */}
      <View style={styles.toggleRow}>
        <View>
          <Text style={styles.toggleLabel}>Make this public</Text>
          <Text style={styles.toggleSub}>Appears on the community feed</Text>
        </View>
        <Switch
          value={isPublic}
          onValueChange={setIsPublic}
          trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
          thumbColor={isPublic ? '#4F46E5' : '#9CA3AF'}
        />
      </View>

      <TouchableOpacity style={[styles.btn, { marginTop: 20 }]} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.btnText}>{submitting ? 'Sending...' : 'Send Feedback ✨'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  hint: { fontSize: 15, color: '#6B7280' },
  btn: { backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  receiverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  receiverName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  receiverUname: { fontSize: 13, color: '#6B7280' },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  typeBtnActive: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  typeEmoji: { fontSize: 18 },
  typeBtnText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  typeBtnTextActive: { color: '#4F46E5' },
  textarea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: '#111827',
    height: 130,
  },
  charCount: { fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginTop: 4, marginBottom: 4 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    justifyContent: 'space-between',
    marginTop: 8,
  },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  toggleSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
});
