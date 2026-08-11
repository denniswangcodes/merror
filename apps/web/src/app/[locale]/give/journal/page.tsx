'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ImagePlus, X, NotebookPen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/auth.context';
import { useTheme } from '@/context/theme.context';
import { feedbackApi } from '@/lib/api';
import { FEEDBACK_TYPE_META } from '@merror/shared';
import type { FeedbackType } from '@merror/shared';
import { cn } from '@/lib/utils';

const FEEDBACK_TYPES: FeedbackType[] = ['COMPLIMENT', 'HELPFUL_ACT', 'MEMORY', 'COMMUNITY_SERVICE'];

/** Compress an image file to a base64 JPEG ≤ given dimension and quality */
function compressImage(file: File, maxPx = 1080, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function JournalEntryPage(): JSX.Element {
  const params = useParams<{ locale: string }>();
  const locale = params.locale || 'en';
  const router = useRouter();
  const { user: me } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [recipientName, setRecipientName] = useState('');
  const [type, setType] = useState<FeedbackType>('COMPLIMENT');
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10 MB');
      return;
    }
    setError('');
    const compressed = await compressImage(file);
    setImagePreview(compressed);
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await feedbackApi.create({
        recipientName: recipientName.trim() || undefined,
        type,
        message,
        isPublic,
        ...(imagePreview ? { imageUrl: imagePreview } : {}),
      });
      setSubmitted(true);
      setTimeout(() => router.push(`/${locale}/profile`), 1500);
    } catch (e) {
      setError((e as Error).message || 'Failed to save journal entry');
      setSubmitting(false);
    }
  };

  if (!me) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-text-secondary mb-4">You need to be logged in to journal a good deed.</p>
        <Button onClick={() => router.push(`/${locale}/login`)}>Login</Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="px-4 py-10 text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
          className="text-[64px] mb-4"
        >
          📓
        </motion.div>
        <h2 className="font-display text-2xl font-bold text-text-primary m-0 mb-2">Saved to your journal</h2>
        <p className="text-sm text-text-muted">
          {isPublic ? 'This moment is now part of your story — and published on your profile.' : 'This moment is now part of your story — visible only to you.'}
        </p>
      </motion.div>
    );
  }

  const currentMeta = FEEDBACK_TYPE_META[type];

  return (
    <div className="py-8 max-w-lg">
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
          <NotebookPen className="h-5 w-5 text-accent" />
        </div>
        <div>
          <div className="font-bold text-[15px] text-text-primary">Journal a good deed</div>
          <p className="m-0 text-xs text-text-muted">
            For someone who isn&apos;t on Merror yet. Keep it private for your own record, or publish it to your wall.
          </p>
        </div>
      </div>

      <p className="text-xs font-semibold text-text-muted tracking-wider uppercase mb-2">
        Who was this for? <span className="normal-case font-normal text-text-muted">(optional)</span>
      </p>
      <Input
        type="text"
        placeholder="e.g. a stranger at the coffee shop"
        value={recipientName}
        onChange={(e) => setRecipientName(e.target.value)}
        maxLength={60}
        className="mb-5"
      />

      {/* Type selector */}
      <p className="text-xs font-semibold text-text-muted tracking-wider uppercase mb-2.5">
        What kind of moment is this?
      </p>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {FEEDBACK_TYPES.map((t) => {
          const meta = FEEDBACK_TYPE_META[t];
          const active = type === t;
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              className="min-h-11 px-2 py-2.5 rounded-xl text-[11px] font-semibold cursor-pointer transition-all border-2"
              style={{
                borderColor: active ? (isDark ? meta.darkColor ?? meta.color : meta.color) : 'rgb(var(--color-border))',
                background: active ? (isDark ? meta.darkBg ?? meta.bg : meta.bg) : 'transparent',
                color: active
                  ? (isDark ? meta.darkTextColor ?? meta.textColor : meta.textColor)
                  : 'rgb(var(--color-text-muted))',
              }}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Message */}
      <p className="text-xs font-semibold text-text-muted tracking-wider uppercase mb-2">
        What happened
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={280}
        placeholder={`Describe the ${currentMeta.label.toLowerCase()}, for your own record...`}
        className="w-full min-h-[120px] px-3.5 py-3 rounded-xl border border-border bg-surface text-text-primary text-[15px] leading-relaxed resize-none outline-none mb-1.5 box-border transition-colors focus:ring-2 focus:ring-accent/40 focus:border-accent"
      />
      <div className="flex justify-between mb-4">
        <span className="text-[11px] text-text-muted">{280 - message.length} characters left</span>
      </div>

      {/* Image upload */}
      <p className="text-xs font-semibold text-text-muted tracking-wider uppercase mb-2">
        Add a photo <span className="normal-case font-normal text-text-muted">(optional)</span>
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
      {imagePreview ? (
        <div className="relative mb-5 rounded-xl overflow-hidden border border-border">
          <img src={imagePreview} alt="preview" className="w-full object-cover max-h-56" />
          <button
            onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center border-none cursor-pointer hover:bg-black/80 transition-colors"
            title="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3.5 mb-5 rounded-xl border-2 border-dashed border-border text-text-muted text-[13px] font-medium hover:border-accent hover:text-accent transition-colors bg-transparent cursor-pointer flex items-center justify-center gap-2"
        >
          <ImagePlus className="h-4 w-4" /> Tap to add a photo
        </button>
      )}

      {/* Public toggle */}
      <div className="flex items-center justify-between px-3.5 py-3 bg-background rounded-xl mb-5">
        <div>
          <div className="font-semibold text-[13px] text-text-primary">Publish to your profile</div>
          <div className="text-xs text-text-muted">{isPublic ? 'Visible to anyone who visits your profile' : 'Keep private — only you can see it'}</div>
        </div>
        <button
          onClick={() => setIsPublic(!isPublic)}
          className={cn('relative w-11 h-6 rounded-full border-none cursor-pointer transition-colors', isPublic ? 'bg-accent' : 'bg-border-strong')}
        >
          <motion.span
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white"
            animate={{ left: isPublic ? 22 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {error && <p className="text-danger text-sm mb-3">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={!message.trim()}
        loading={submitting}
        size="lg"
        className="w-full"
      >
        {submitting ? (
          'Saving…'
        ) : (
          <span className="inline-flex items-center gap-1.5">
            Save to journal <NotebookPen className="h-4 w-4" />
          </span>
        )}
      </Button>
    </div>
  );
}
