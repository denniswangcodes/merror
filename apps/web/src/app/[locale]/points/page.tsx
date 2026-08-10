'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Sparkles, HandHeart, Infinity as InfinityIcon } from 'lucide-react';
import { TierBadge } from '@/components/TierBadge';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/auth.context';
import { TIERS, getTierProgress, type FeedbackType } from '@merror/shared';

const TIER_DESCRIPTIONS = {
  'first-light': 'Every positive impact starts with a first reflection. This is the beginning of your story.',
  'bright-spark': 'Your kindness is getting noticed. You are creating moments that stay with people.',
  beacon: 'You show up for your community again and again—and your impact shines through.',
  luminary: 'Merror’s highest recognition, earned through a lasting legacy of positive impact.',
} as const;

const EARNING_POINTS = [
  { icon: Sparkles, title: 'Be recognized', description: 'Earn one lumen whenever someone records a Kind Word, Helping Hand, or Shared Moment for you.' },
  { icon: HandHeart, title: 'Recognize someone', description: 'Recording a reflection is always free. Your recognition helps someone else rise.' },
  { icon: InfinityIcon, title: 'Build a lasting record', description: 'Lumens never expire. Your total tells the story of the good you have put into your community.' },
];

const REFLECTION_TYPES: { type: FeedbackType; desc: string }[] = [
  { type: 'COMPLIMENT', desc: 'Recognize the character, energy, or work that makes someone exceptional.' },
  { type: 'HELPFUL_ACT', desc: 'Record a moment when someone showed up, pitched in, or made life easier.' },
  { type: 'MEMORY', desc: 'Save a meaningful moment you shared and remind someone that it mattered.' },
];

const SECTION_LABEL = 'text-xs font-semibold text-text-muted uppercase tracking-widest mb-3';

export default function PointsPage(): JSX.Element {
  const params = useParams<{ locale: string }>();
  const locale = params.locale || 'en';
  const { user } = useAuth();
  const progress = user ? getTierProgress(user.totalPoints) : null;

  return (
    <div className="pt-6 pb-12">
      <Link href={`/${locale}/profile`} className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors no-underline mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to profile
      </Link>

      <h1 className="font-display text-3xl font-extrabold text-text-primary m-0 mb-1.5 tracking-tight">Your impact, recognized.</h1>
      <p className="text-sm text-text-muted mb-8">Every reflection is proof that something you did mattered to someone.</p>

      {user && progress && (
        <Card className="relative overflow-hidden p-5 mb-8 border-accent/20 bg-gradient-to-br from-accent/[0.09] via-surface to-surface">
          <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="m-0 mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">Your current status</p>
              <TierBadge points={user.totalPoints} />
              <p className="m-0 mt-2 text-sm font-medium text-text-secondary">{progress.tier.tagline}</p>
            </div>
            <div className="text-right"><span className="font-display text-3xl font-black text-text-primary">{user.totalPoints}</span><span className="ml-1 text-xs font-semibold uppercase tracking-wide text-text-muted">lumens</span></div>
          </div>
          <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-border/70">
            <div className="h-full rounded-full bg-gradient-to-r from-accent to-violet-400 transition-all" style={{ width: `${progress.progress}%` }} />
          </div>
          <div className="relative mt-2 flex justify-between text-xs font-medium text-text-muted">
            <span>{progress.progress}% through this status</span>
            <span>{progress.pointsToNext ? `${progress.pointsToNext} lumens to level up` : 'Top status achieved'}</span>
          </div>
        </Card>
      )}

      <section className="mb-8">
        <h2 className={SECTION_LABEL}>How lumens work</h2>
        <Card className="overflow-hidden divide-y divide-border">
          {EARNING_POINTS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4 px-5 py-4">
              <div className="mt-0.5 w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0"><Icon className="h-4 w-4 text-accent" /></div>
              <div><p className="font-semibold text-sm text-text-primary m-0">{title}</p><p className="text-sm text-text-muted m-0 mt-0.5">{description}</p></div>
            </div>
          ))}
        </Card>
      </section>

      <section className="mb-8">
        <h2 className={SECTION_LABEL}>Status levels</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {TIERS.map((tier) => (
            <Card key={tier.id} className="px-5 py-5 transition-all hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-md">
              <div className="mb-3 flex items-center justify-between gap-2">
                <TierBadge points={tier.minPoints} />
                <span className="text-xs text-text-muted font-semibold">{tier.nextTierAt ? `${tier.minPoints}–${tier.nextTierAt - 1} lumens` : `${tier.minPoints}+ lumens`}</span>
              </div>
              <p className="m-0 text-sm font-bold text-text-primary">{tier.tagline}</p>
              <p className="text-sm text-text-muted m-0 mt-1">{TIER_DESCRIPTIONS[tier.id]}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className={SECTION_LABEL}>Ways to recognize someone</h2>
        <Card className="overflow-hidden divide-y divide-border">
          {REFLECTION_TYPES.map((item) => (
            <div key={item.type} className="flex items-start gap-3 px-5 py-4"><Badge type={item.type} /><p className="text-sm text-text-muted m-0 pt-0.5">{item.desc}</p></div>
          ))}
        </Card>
      </section>
    </div>
  );
}
