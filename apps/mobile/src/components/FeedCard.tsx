import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { useAppTheme } from '../lib/theme';
import { feedbackApi } from '../lib/api';
import { compressToDataUrl, pickImage, showImageSourceSheet } from '../lib/image';
import { formatReflectionDate, MAX_REFLECTION_IMAGE_CHARS, type CommentItem, type FeedbackItem } from '@merror/shared';

type Props = {
  item: FeedbackItem;
  onGiverPress?: () => void;
  onReceiverPress?: () => void;
  onReport?: () => void;
  onShare?: () => void;
  canDelete?: boolean;
  canEditPhoto?: boolean;
  onDelete?: () => void;
  onPhotoChanged?: (imageUrl: string | null) => void;
};
const DEFAULTS: Record<FeedbackItem['type'], string> = {
  COMPLIMENT: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=85', HELPFUL_ACT: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&auto=format&fit=crop&q=85', MEMORY: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=85', ENCOURAGEMENT: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=85', COMMUNITY_SERVICE: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&auto=format&fit=crop&q=85', ENVIRONMENTAL_ACT: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=85',
};

export function FeedCard({ item, onGiverPress, onReceiverPress, onReport, onShare, canDelete, canEditPhoto, onDelete, onPhotoChanged }: Props) {
  const theme = useAppTheme(); const giver = item.giver; const receiver = item.receiver;
  const [liked, setLiked] = useState(!!item.likedByMe); const [likeCount, setLikeCount] = useState(item.likeCount ?? 0); const [likeBusy, setLikeBusy] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false); const [comments, setComments] = useState<CommentItem[] | null>(null); const [commentCount, setCommentCount] = useState(item.commentCount ?? 0); const [draft, setDraft] = useState(''); const [posting, setPosting] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(item.imageUrl ?? null); const [updatingPhoto, setUpdatingPhoto] = useState(false);
  const toggleLike = async () => { if (likeBusy) return; const next = !liked; setLiked(next); setLikeCount((n) => n + (next ? 1 : -1)); setLikeBusy(true); try { const r = await feedbackApi.toggleLike(item.id); setLiked(r.liked); setLikeCount(r.likeCount); } catch { setLiked(!next); setLikeCount((n) => n + (next ? -1 : 1)); } finally { setLikeBusy(false); } };
  const toggleComments = async () => { const opening = !commentsOpen; setCommentsOpen(opening); if (opening && comments === null) try { setComments(await feedbackApi.getComments(item.id)); } catch { setComments([]); } };
  const post = async () => { const message = draft.trim(); if (!message || posting) return; setPosting(true); try { const created = await feedbackApi.addComment(item.id, message); setComments((c) => [...(c ?? []), created]); setCommentCount((n) => n + 1); setDraft(''); } finally { setPosting(false); } };

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
    if (onReport) buttons.push({ text: 'Report', onPress: onReport });
    if (canEditPhoto) buttons.push({ text: 'Edit photo', onPress: editPhoto });
    if (canDelete) buttons.push({ text: 'Delete', style: 'destructive', onPress: confirmDelete });
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Reflection options', undefined, buttons);
  };

  return <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
    <View style={s.photoWrap}>
      <Image source={{ uri: currentImageUrl || DEFAULTS[item.type] }} style={s.image} resizeMode="cover" />
      <View style={s.photoBadge}><Badge type={item.type} /></View>
      {updatingPhoto && <View style={s.photoOverlay}><ActivityIndicator color="#fff" /></View>}
    </View>
    <View style={s.body}><View style={s.header}>
      {giver && <TouchableOpacity style={s.userRow} onPress={onGiverPress} disabled={!onGiverPress}><Avatar displayName={giver.displayName} username={giver.username} size={28} /><Text numberOfLines={1} style={[s.username, { color: theme.text }]}>{giver.displayName || giver.username}</Text></TouchableOpacity>}
      <Text style={{ color: theme.muted }}>→</Text>
      {receiver && <TouchableOpacity style={s.userRow} onPress={onReceiverPress} disabled={!onReceiverPress}><Avatar displayName={receiver.displayName} username={receiver.username} size={28} /><Text numberOfLines={1} style={[s.username, { color: theme.text }]}>{receiver.displayName || receiver.username}</Text></TouchableOpacity>}
      <Text style={[s.time, { color: theme.muted }]}>{formatReflectionDate(item.createdAt)}</Text>
    </View><Text style={[s.message, { color: theme.text }]}>{item.message}</Text>
    <View style={s.actions}><TouchableOpacity onPress={toggleLike} style={s.action} accessibilityLabel={liked ? 'Unlike reflection' : 'Like reflection'}><Ionicons name={liked ? 'heart' : 'heart-outline'} size={25} color={liked ? '#E5485D' : theme.textSecondary} /></TouchableOpacity><TouchableOpacity onPress={toggleComments} style={s.action} accessibilityLabel="Comment on reflection"><Ionicons name="chatbubble-outline" size={23} color={theme.textSecondary} /></TouchableOpacity>{onShare && <TouchableOpacity onPress={onShare} style={s.action} accessibilityLabel="Share reflection"><Ionicons name="paper-plane-outline" size={24} color={theme.textSecondary} /></TouchableOpacity>}{(onReport || canEditPhoto || canDelete) && <TouchableOpacity onPress={openOptions} style={s.reportButton} accessibilityLabel="More reflection options"><Ionicons name="ellipsis-horizontal" size={22} color={theme.muted} /></TouchableOpacity>}</View>
    {likeCount > 0 && <Text style={[s.count, { color: theme.text }]}>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</Text>}
    {!commentsOpen && commentCount > 0 && <TouchableOpacity onPress={toggleComments}><Text style={[s.viewComments, { color: theme.muted }]}>View all {commentCount} {commentCount === 1 ? 'comment' : 'comments'}</Text></TouchableOpacity>}
    {commentsOpen && <View style={[s.comments, { borderTopColor: theme.border }]}>{comments === null ? <ActivityIndicator color={theme.accent} /> : comments.map((c) => <View key={c.id} style={s.comment}><Avatar displayName={c.user?.displayName ?? null} username={c.user?.username ?? '?'} avatarUrl={c.user?.avatarUrl} size={25} /><Text style={[s.commentText, { color: theme.textSecondary }]}><Text style={{ color: theme.text, fontWeight: '800' }}>{c.user?.displayName || c.user?.username} </Text>{c.message}</Text></View>)}<View style={s.composer}><TextInput value={draft} onChangeText={setDraft} onSubmitEditing={post} maxLength={280} placeholder="Add a comment…" placeholderTextColor={theme.muted} style={[s.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]} /><TouchableOpacity onPress={post} disabled={!draft.trim() || posting}><Text style={{ color: theme.accent, fontWeight: '800', opacity: !draft.trim() || posting ? 0.4 : 1 }}>Post</Text></TouchableOpacity></View></View>}
    </View></View>;
}

const s = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, marginBottom: 12, marginHorizontal: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 }, photoWrap: { position: 'relative', margin: 10, marginBottom: 0 }, image: { width: '100%', aspectRatio: 4 / 5, borderRadius: 12 }, photoBadge: { position: 'absolute', left: 12, top: 12 }, photoOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' }, body: { paddingHorizontal: 18, paddingTop: 17, paddingBottom: 20 }, header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 6 }, userRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }, username: { fontSize: 13, fontWeight: '700', flexShrink: 1 }, time: { fontSize: 10, fontWeight: '600', marginLeft: 'auto' }, message: { fontSize: 15, fontWeight: '500', lineHeight: 23 }, actions: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 3 }, action: { width: 39, height: 38, alignItems: 'center', justifyContent: 'center' }, reportButton: { marginLeft: 'auto', padding: 8 }, count: { fontSize: 13, fontWeight: '800', marginTop: 2 }, viewComments: { fontSize: 13, fontWeight: '600', marginTop: 7 }, comments: { borderTopWidth: 1, marginTop: 12, paddingTop: 12, gap: 10 }, comment: { flexDirection: 'row', gap: 8 }, commentText: { flex: 1, fontSize: 13, lineHeight: 19 }, composer: { flexDirection: 'row', alignItems: 'center', gap: 9 }, input: { flex: 1, borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13 },
});
