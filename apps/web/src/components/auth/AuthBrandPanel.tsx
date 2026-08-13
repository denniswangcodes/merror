'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogoMark } from '@/components/ui/Logo';

const FLOATING_PILLS = [
  { label: 'Kind Word', emoji: '💬' },
  { label: 'Helping Hand', emoji: '🤝' },
  { label: 'Shared Moment', emoji: '✨' },
];

export function AuthBrandPanel() {
  return (
    <div className="relative overflow-hidden rounded-b-[2rem] lg:rounded-none lg:w-[45%] lg:min-h-screen flex flex-col justify-between gap-6 px-6 py-8 lg:px-12 lg:py-14 bg-gradient-to-br from-[#6D5BFF] to-[#FF7A6B] text-white">
      {/* decorative blurred accents */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 w-72 h-72 rounded-full bg-black/10 blur-3xl" />

      <Link href="/" className="relative z-10 inline-flex items-center gap-2 no-underline w-fit">
        <LogoMark size={30} />
        <span className="font-display font-bold text-lg text-white">merror</span>
      </Link>

      <div className="relative z-10 max-w-sm">
        <h2 className="font-display text-xl lg:text-3xl font-bold leading-tight mb-3">
          A reflection of the good in people.
        </h2>
        <div className="hidden lg:block">
          <p className="text-white/80 text-sm leading-relaxed mb-6">
            Recognize kind words, celebrate helping hands, and hold onto shared moments—then watch your community’s impact add up.
          </p>
          <div className="flex flex-wrap gap-2">
            {FLOATING_PILLS.map((p, i) => (
              <motion.span
                key={p.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
                className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 text-xs font-semibold"
              >
                <span>{p.emoji}</span>
                {p.label}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      <p className="relative z-10 hidden lg:block text-xs text-white/60">© {new Date().getFullYear()} merror</p>
    </div>
  );
}
