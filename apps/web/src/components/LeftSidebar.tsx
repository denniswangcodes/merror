'use client';

import { useEffect, useState } from 'react';
import { Newspaper } from 'lucide-react';
import { newsApi, type NewsItem } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';

export function LeftSidebar({ locale: _locale }: { locale: string }) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsApi.getPositiveNews()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-4 h-full flex flex-col">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3 px-1 flex items-center gap-1.5">
        <Newspaper className="h-3.5 w-3.5" />
        Positivities Today
      </p>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
        {loading ? (
          <div className="flex flex-col flex-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-1 py-4">
                <Skeleton className="h-3 mb-2 w-5/6" />
                <Skeleton className="h-2.5 w-full" />
                <Skeleton className="h-2.5 mt-1 w-4/6" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-xs text-text-muted text-center mt-8">No news right now</p>
        ) : (
          <div className="flex flex-col flex-1">
            {items.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 flex flex-col pb-4 no-underline group ${i === 0 ? 'pt-0' : 'pt-4'}`}
              >
                <p className="text-[13px] font-medium text-text-primary leading-snug group-hover:text-accent transition-colors m-0 mb-1.5">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-[11.5px] text-text-muted leading-relaxed m-0 line-clamp-4">
                    {item.description}
                  </p>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
