'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Sparkles, HandHeart, Infinity as InfinityIcon } from 'lucide-react';
import { TierBadge } from '@/components/TierBadge';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/ui/Card';
import type { FeedbackType } from '@merror/shared';

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

const EARNING_POINTS = [
  {
    icon: Sparkles,
    title: 'Receive a Reflection',
    description:
      'Every time someone sends you a reflection — a compliment, helpful act, or memory — you earn +1 point. The more people appreciate you, the higher you climb.',
  },
  {
    icon: HandHeart,
    title: 'Give a Reflection',
    description:
      'Giving reflections doesn\'t cost you points, and it earns your friends their points. Generosity is its own reward — be the reason someone levels up.',
  },
  {
    icon: InfinityIcon,
    title: 'Points accumulate forever',
    description: 'Points never reset or expire. Your total reflects your entire journey on Merror.',
  },
];

const REFLECTION_TYPES: { type: FeedbackType; desc: string }[] = [
  { type: 'COMPLIMENT', desc: 'Acknowledge something wonderful about someone — their personality, work, or presence.' },
  { type: 'HELPFUL_ACT', desc: 'Recognise something someone did for you or others. Actions big and small count.' },
  { type: 'MEMORY', desc: 'Share a cherished moment you shared together. A reminder that they matter to you.' },
];

const SECTION_LABEL = 'text-xs font-semibold text-text-muted uppercase tracking-widest mb-3';

export default function PointsPage(): JSX.Element {
  const params = useParams<{ locale: string }>();
  const locale = params.locale || 'en';

  return (
    <div className="pt-6 pb-12">
      {/* Back */}
      <Link
        href={`/${locale}/profile`}
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors no-underline mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Link>

      <h1 className="font-display text-2xl font-extrabold text-text-primary m-0 mb-1.5 tracking-tight">
        How Points Work
      </h1>
      <p className="text-sm text-text-muted mb-8">
        Points reflect the positive impact you have on your community.
      </p>

      {/* How you earn points */}
      <section className="mb-8">
        <h2 className={SECTION_LABEL}>Earning Points</h2>
        <Card className="overflow-hidden divide-y divide-border">
          {EARNING_POINTS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4 px-5 py-4">
              <div className="mt-0.5 w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-sm text-text-primary m-0">{title}</p>
                <p className="text-sm text-text-muted m-0 mt-0.5">{description}</p>
              </div>
            </div>
          ))}
        </Card>
      </section>

      {/* Tiers */}
      <section className="mb-8">
        <h2 className={SECTION_LABEL}>Tiers</h2>
        <div className="flex flex-col gap-3">
          {TIERS.map((tier) => (
            <Card key={tier.title} className="px-5 py-4 flex items-start gap-4">
              <div className="pt-0.5">
                <TierBadge points={tier.points} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-sm text-text-primary">{tier.title}</span>
                  <span className="text-xs text-text-muted font-medium">{tier.range}</span>
                </div>
                <p className="text-sm text-text-muted m-0">{tier.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Reflection types quick ref */}
      <section>
        <h2 className={SECTION_LABEL}>Reflection Types</h2>
        <Card className="overflow-hidden divide-y divide-border">
          {REFLECTION_TYPES.map((t) => (
            <div key={t.type} className="flex items-start gap-3 px-5 py-4">
              <Badge type={t.type} />
              <p className="text-sm text-text-muted m-0 pt-0.5">{t.desc}</p>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
