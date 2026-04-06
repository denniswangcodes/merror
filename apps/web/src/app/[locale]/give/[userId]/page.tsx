'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Avatar } from '@/components/Avatar';
import { TierBadge } from '@/components/TierBadge';
import { useAuth } from '@/context/auth.context';
import { usersApi, feedbackApi } from '@/lib/api';
import type { PublicUser } from '@merror/shared';

const FEEDBACK_TYPES = [
  { key: 'COMPLIMENT', label: 'Compliment', color: '#1D4ED8', bg: '#DBEAFE', textColor: '#1E40AF' },
  { key: 'HELPFUL_ACT', label: 'Helpful Act', color: '#15803D', bg: '#DCFCE7', textColor: '#166534' },
  { key: 'MEMORY', label: 'Memory', color: '#7E22CE', bg: '#F3E8FF', textColor: '#6B21A8' },
];

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

export default function GiveFeedbackPage(): JSX.Element {
  const params = useParams<{ locale: string; userId: string }>();
  const { locale, userId } = params;
  const router = useRouter();
  const { user: me } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [receiver, setReceiver] = useState<PublicUser | null>(null);
  const [type, setType] = useState('COMPLIMENT');
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    usersApi.getById(userId).then(setReceiver).catch(() => router.push(`/${locale}/scan`));
  }, [userId, locale, router]);

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
    if (!message.trim() || !receiver) return;
    setSubmitting(true);
    setError('');
    try {
      await feedbackApi.create({
        receiverId: receiver.id,
        type,
        message,
        isPublic,
        ...(imagePreview ? { imageUrl: imagePreview } : {}),
      });
      setSubmitted(true);
      setTimeout(() => router.push(`/${locale}/feed?success=1`), 1500);
    } catch (e) {
      setError((e as Error).message || 'Failed to send feedback');
      setSubmitting(false);
    }
  };

  if (!me) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-500 mb-4">You need to be logged in to give feedback.</p>
        <button
          onClick={() => router.push(`/${locale}/login`)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm"
        >
          Login
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="px-4 py-10 text-center">
        <div className="text-[64px] mb-4">🌟</div>
        <h2 className="text-gray-900 dark:text-white" style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
          Sent with love
        </h2>
        <p className="text-[14px] text-gray-500">
          Your kind words are on their way to {receiver?.displayName || receiver?.username}
        </p>
      </div>
    );
  }

  if (!receiver) {
    return <div className="px-4 py-8 text-center text-gray-400 text-sm">Loading...</div>;
  }

  const currentType = FEEDBACK_TYPES.find((t) => t.key === type)!;

  return (
    <div className="py-8 max-w-lg">
      <button
        onClick={() => router.push(`/${locale}/scan`)}
        className="text-indigo-600 text-[13px] mb-5 flex items-center gap-1 bg-none border-none cursor-pointer p-0"
      >
        ← Back
      </button>

      {/* Receiver card */}
      <div className="flex items-center gap-3 mb-5 p-3.5 bg-gray-50 dark:bg-gray-800 rounded-[14px] border border-gray-200 dark:border-gray-700">
        <Avatar displayName={receiver.displayName} username={receiver.username} avatarUrl={receiver.avatarUrl} size={48} />
        <div>
          <div className="font-bold text-[15px] text-gray-900 dark:text-gray-100">{receiver.displayName || receiver.username}</div>
          <div className="text-xs text-gray-500">@{receiver.username}</div>
          <TierBadge points={receiver.totalPoints} locale={locale} />
        </div>
      </div>

      {/* Type selector */}
      <p className="text-[12px] font-semibold text-gray-500 tracking-wider uppercase mb-2.5">
        What kind of moment is this?
      </p>
      <div className="flex gap-2 mb-5">
        {FEEDBACK_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setType(t.key)}
            className={`flex-1 py-2.5 rounded-[10px] text-[11px] font-semibold cursor-pointer transition-all ${type !== t.key ? 'bg-white dark:bg-gray-800' : ''}`}
            style={{
              border: `2px solid ${type === t.key ? t.color : '#E5E7EB'}`,
              ...(type === t.key ? { background: t.bg, color: t.textColor } : { color: '#6B7280' }),
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Message */}
      <p className="text-[12px] font-semibold text-gray-500 tracking-wider uppercase mb-2">
        Your message
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={280}
        placeholder={`Share a genuine ${currentType.label.toLowerCase()} for ${receiver.displayName || receiver.username}...`}
        className="w-full min-h-[120px] px-3.5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 text-[15px] leading-relaxed text-gray-800 resize-none outline-none mb-1.5 box-border"
        style={{ fontFamily: 'inherit' }}
      />
      <div className="flex justify-between mb-4">
        <span className="text-[11px] text-gray-400">{280 - message.length} characters left</span>
      </div>

      {/* Image upload */}
      <p className="text-[12px] font-semibold text-gray-500 tracking-wider uppercase mb-2">
        Add a photo <span className="normal-case font-normal text-gray-400">(optional)</span>
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
      {imagePreview ? (
        <div className="relative mb-5 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <img src={imagePreview} alt="preview" className="w-full object-cover max-h-56" />
          <button
            onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-base leading-none border-none cursor-pointer hover:bg-black/80 transition-colors"
            title="Remove image"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3.5 mb-5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 text-[13px] font-medium hover:border-indigo-400 hover:text-indigo-500 transition-colors bg-transparent cursor-pointer"
        >
          + Tap to add a photo
        </button>
      )}

      {/* Public toggle */}
      <div className="flex items-center justify-between px-3.5 py-3 bg-gray-50 dark:bg-gray-800 rounded-[10px] mb-5">
        <div>
          <div className="font-semibold text-[13px] text-gray-800 dark:text-gray-200">Make this public</div>
          <div className="text-xs text-gray-400">Visible to everyone in the feed</div>
        </div>
        <button
          onClick={() => setIsPublic(!isPublic)}
          className="relative border-none cursor-pointer transition-colors"
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            background: isPublic ? '#4F46E5' : '#D1D5DB',
          }}
        >
          <span
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
            style={{ left: isPublic ? 22 : 2 }}
          />
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!message.trim() || submitting}
        className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white border-none cursor-pointer transition-colors"
        style={{ background: message.trim() && !submitting ? '#4F46E5' : '#D1D5DB' }}
      >
        {submitting ? 'Sending...' : `Send ${currentType.label} ✨`}
      </button>
    </div>
  );
}
