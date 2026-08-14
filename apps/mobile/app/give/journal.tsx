import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { FeedbackType } from '@merror/shared';
import { FEEDBACK_TYPE_META, MAX_REFLECTION_IMAGE_CHARS } from '@merror/shared';
import { GradientButton } from '../../src/components/GradientButton';
import { useAuth } from '../../src/context/auth.context';
import { useAppTheme } from '../../src/lib/theme';
import { feedbackApi } from '../../src/lib/api';
import { compressToDataUrl, pickImage, showImageSourceSheet } from '../../src/lib/image';

const TYPES: FeedbackType[] = ['COMPLIMENT', 'HELPFUL_ACT', 'MEMORY', 'COMMUNITY_SERVICE'];

export default function JournalScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const theme = useAppTheme();
  const [recipientName, setRecipientName] = useState('');
  const [type, setType] = useState<FeedbackType>('COMPLIMENT');
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const addPhoto = () => showImageSourceSheet(async (source) => {
    const uri = await pickImage(source, [1, 1]);
    if (!uri) return;
    setProcessingImage(true);
    try {
      setImagePreview(await compressToDataUrl(uri, { maxChars: MAX_REFLECTION_IMAGE_CHARS }));
    } finally {
      setProcessingImage(false);
    }
  });

  const submit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await feedbackApi.create({
        recipientName: recipientName.trim() || undefined,
        type,
        message: message.trim(),
        isPublic,
        ...(imagePreview ? { imageUrl: imagePreview } : {}),
      });
      setSubmitted(true);
      setTimeout(() => router.replace('/(tabs)/profile'), 1200);
    } catch (error) {
      Alert.alert('Could not save', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.hint, { color: theme.textSecondary }]}>Sign in to journal a good deed</Text>
        <GradientButton style={styles.primary} onPress={() => router.push('/auth/login')} label="Sign in" textStyle={styles.primaryText} />
      </View>
    );
  }

  if (submitted) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={styles.doneEmoji}>📓</Text>
        <Text style={[styles.doneTitle, { color: theme.text }]}>Saved to your journal</Text>
        <Text style={[styles.doneCopy, { color: theme.muted }]}>
          {isPublic ? 'This moment is now part of your story — and published on your profile.' : 'This moment is now part of your story — visible only to you.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.background }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={[styles.intro, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <View style={[styles.introIcon, { backgroundColor: `${theme.accent}1A` }]}>
          <Ionicons name="book-outline" size={18} color={theme.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.introTitle, { color: theme.text }]}>Journal a good deed</Text>
          <Text style={[styles.introCopy, { color: theme.muted }]}>For someone who isn't on Merror yet. Keep it private, or publish it to your wall.</Text>
        </View>
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Who was this for? <Text style={styles.optional}>(optional)</Text></Text>
      <TextInput
        style={[styles.recipientInput, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
        placeholder="e.g. a stranger at the coffee shop"
        placeholderTextColor={theme.muted}
        value={recipientName}
        onChangeText={setRecipientName}
        maxLength={60}
      />

      <Text style={[styles.label, { color: theme.textSecondary }]}>What kind of moment is this?</Text>
      <View style={styles.typeRow}>
        {TYPES.map((t) => {
          const meta = FEEDBACK_TYPE_META[t];
          const active = type === t;
          const activeColor = theme.dark ? meta.darkColor ?? meta.color : meta.color;
          const activeBg = theme.dark ? meta.darkBg ?? meta.bg : meta.bg;
          const activeText = theme.dark ? meta.darkTextColor ?? meta.textColor : meta.textColor;
          return (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeButton,
                { borderColor: active ? activeColor : theme.border, backgroundColor: active ? activeBg : theme.surface },
              ]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeText, { color: active ? activeText : theme.muted }]}>{meta.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>What happened</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
        multiline
        maxLength={280}
        textAlignVertical="top"
        value={message}
        onChangeText={setMessage}
        placeholder="Describe the moment, for your own record…"
        placeholderTextColor={theme.muted}
      />
      <Text style={[styles.count, { color: theme.muted }]}>{280 - message.length} characters left</Text>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Add a photo <Text style={styles.optional}>(optional)</Text></Text>
      {imagePreview ? (
        <View style={styles.photoPreviewWrap}>
          <Image source={{ uri: imagePreview }} style={styles.photoPreview} resizeMode="cover" />
          <TouchableOpacity style={styles.photoChangeBtn} onPress={addPhoto} accessibilityLabel="Change photo"><Ionicons name="image-outline" size={16} color="#fff" /></TouchableOpacity>
          <TouchableOpacity style={styles.photoRemoveBtn} onPress={() => setImagePreview(null)} accessibilityLabel="Remove photo"><Ionicons name="close" size={16} color="#fff" /></TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={[styles.photoAdd, { borderColor: theme.border }]} onPress={addPhoto} disabled={processingImage}>
          {processingImage ? <ActivityIndicator color={theme.accent} /> : <><Ionicons name="image-outline" size={18} color={theme.muted} /><Text style={[styles.photoAddText, { color: theme.muted }]}>Tap to add a photo</Text></>}
        </TouchableOpacity>
      )}

      <View style={[styles.visibility, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.visibilityTitle, { color: theme.text }]}>Publish to your profile</Text>
          <Text style={[styles.visibilityCopy, { color: theme.muted }]}>{isPublic ? 'Visible to anyone who visits your profile' : 'Keep private — only you can see it'}</Text>
        </View>
        <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ false: theme.borderStrong, true: `${theme.accent}99` }} thumbColor={isPublic ? theme.accent : '#FFFFFF'} />
      </View>

      <GradientButton
        disabled={submitting || !message.trim()}
        loading={submitting}
        style={styles.primary}
        onPress={submit}
        icon={<Ionicons name="book-outline" size={16} color="#fff" />}
        label="Save to journal"
        textStyle={styles.primaryText}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32 },
  hint: { fontSize: 15 },
  doneEmoji: { fontSize: 56 },
  doneTitle: { fontSize: 20, fontWeight: '800' },
  doneCopy: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  intro: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 22 },
  introIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  introTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  introCopy: { fontSize: 12, lineHeight: 17 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  optional: { textTransform: 'none', fontWeight: '400', color: '#8A8791' },
  recipientInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, marginBottom: 20 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 20 },
  typeButton: { width: '48.5%', minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderRadius: 12, paddingHorizontal: 5 },
  typeText: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  input: { height: 132, borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 15 },
  count: { textAlign: 'right', fontSize: 11, marginTop: 5, marginBottom: 16 },
  photoAdd: { minHeight: 52, borderWidth: 2, borderStyle: 'dashed', borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: 20 },
  photoAddText: { fontSize: 13, fontWeight: '600' },
  photoPreviewWrap: { position: 'relative', marginBottom: 20, borderRadius: 14, overflow: 'hidden' },
  photoPreview: { width: '100%', aspectRatio: 1, backgroundColor: '#E5E2E8' },
  photoChangeBtn: { position: 'absolute', top: 8, right: 42, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  photoRemoveBtn: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  visibility: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 20 },
  visibilityTitle: { fontSize: 14, fontWeight: '600' },
  visibilityCopy: { fontSize: 11, marginTop: 2 },
  primary: { minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
