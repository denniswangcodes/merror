'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { TierBadge } from '@/components/TierBadge';

const TIERS = [
  {
    points: 0,
    range: '0 – 9 pts',
    title: 'New Friend',
    description:
      'Everyone starts here. You\'re new to the community and just beginning to share your kindness.',
  },
  {
    points: 10,
    range: '10 – 49 pts',
    title: 'Kind Soul',
    description:
      'You\'ve started making an impact. People are noticing and appreciating what you bring to the community.',
  },
  {
    points: 50,
    range: '50 – 99 pts',
    title: 'Shining Star',
    description:
      'You\'re a consistent source of warmth and positivity. Your reflections light up the people around you.',
  },
  {
    points: 100,
    range: '100+ pts',
    title: 'Merror Legend',
    description:
      'The highest recognition on Merror. You\'ve built a legacy of kindness that others aspire to.',
  },
];

export default function PointsPage(): JSX.Element {
  const params = useParams<{ locale: string }>();
  const locale = params.locale || 'en';

  return (
    <div className="pt-6 pb-12">
      {/* Back */}
      <Link
        href={`/${locale}/profile`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors no-underline mb-6"
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <h1 className="text-gray-900 dark:text-white" style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.3px' }}>
        How Points Work
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Points reflect the positive impact you have on your community.
      </p>

      {/* How you earn points */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Earning Points
        </h2>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
          <div className="flex items-start gap-4 px-5 py-4">
            <span className="mt-0.5 text-2xl leading-none select-none">✦</span>
            <div>
              <p className="font-semibold text-[14px] text-gray-800 dark:text-gray-200 m-0">Receive a Reflection</p>
              <p className="text-sm text-gray-500 m-0 mt-0.5">
                Every time someone sends you a reflection — a compliment, helpful act, or memory —
                you earn <strong>+1 point</strong>. The more people appreciate you, the higher you climb.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 px-5 py-4">
            <span className="mt-0.5 text-2xl leading-none select-none">♡</span>
            <div>
              <p className="font-semibold text-[14px] text-gray-800 dark:text-gray-200 m-0">Give a Reflection</p>
              <p className="text-sm text-gray-500 m-0 mt-0.5">
                Giving reflections doesn&apos;t cost you points, and it earns your friends their points.
                Generosity is its own reward — be the reason someone levels up.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 px-5 py-4">
            <span className="mt-0.5 text-2xl leading-none select-none">∞</span>
            <div>
              <p className="font-semibold text-[14px] text-gray-800 dark:text-gray-200 m-0">Points accumulate forever</p>
              <p className="text-sm text-gray-500 m-0 mt-0.5">
                Points never reset or expire. Your total reflects your entire journey on Merror.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Tiers
        </h2>
        <div className="flex flex-col gap-3">
          {TIERS.map((tier) => (
            <div
              key={tier.title}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 flex items-start gap-4"
            >
              <div className="pt-0.5">
                <TierBadge points={tier.points} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-[14px] text-gray-900 dark:text-gray-100">{tier.title}</span>
                  <span className="text-xs text-gray-400 font-medium">{tier.range}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 m-0">{tier.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reflection types quick ref */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Reflection Types
        </h2>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
          {[
            { label: 'Compliment', bg: '#DBEAFE', color: '#1E40AF', desc: 'Acknowledge something wonderful about someone — their personality, work, or presence.' },
            { label: 'Helpful Act', bg: '#DCFCE7', color: '#166534', desc: 'Recognise something someone did for you or others. Actions big and small count.' },
            { label: 'Memory', bg: '#F3E8FF', color: '#6B21A8', desc: 'Share a cherished moment you shared together. A reminder that they matter to you.' },
          ].map((t) => (
            <div key={t.label} className="flex items-start gap-3 px-5 py-4">
              <span
                style={{ background: t.bg, color: t.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 50, whiteSpace: 'nowrap', lineHeight: 1.5, letterSpacing: '0.03em' }}
              >
                {t.label}
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 m-0 pt-0.5">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
