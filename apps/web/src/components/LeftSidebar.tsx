'use client';

import { useEffect, useState } from 'react';
import { newsApi, type NewsItem } from '@/lib/api';

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
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3 px-1">Positivities Today</p>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
        {loading ? (
          <div className="flex flex-col flex-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-1 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-2 w-5/6" />
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-full" />
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-1 w-4/6" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-8">No news right now</p>
        ) : (
          <div className="flex flex-col flex-1">
            {items.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex flex-col py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 no-underline group"
              >
                <p className="text-[13px] font-medium text-gray-800 dark:text-gray-200 leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors m-0 mb-1.5">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-[11.5px] text-gray-400 dark:text-gray-500 leading-relaxed m-0 line-clamp-4">
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
