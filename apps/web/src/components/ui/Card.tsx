import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[20px] border border-border/90 bg-surface shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.035)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_10px_30px_rgba(0,0,0,0.12)]',
        className
      )}
      {...props}
    />
  );
}
