import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
}

export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Merror"
      width={size}
      height={size}
      className={cn('rounded-[28%] object-cover', className)}
      style={{ width: size, height: size }}
      priority
    />
  );
}

export function Logo({ size = 28, showWordmark = true, className, wordmarkClassName }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark size={size} />
      {showWordmark && (
        <span
          className={cn('font-display font-bold tracking-tight leading-none', wordmarkClassName ?? 'text-text-primary')}
          style={{ fontSize: size * 0.82 }}
        >
          merror
        </span>
      )}
    </span>
  );
}
