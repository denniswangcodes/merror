'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Avatar } from '@/components/Avatar';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/context/auth.context';
import type { PublicUser } from '@merror/shared';

export default function ScanPage(): JSX.Element {
  const params = useParams<{ locale: string }>();
  const locale = params.locale || 'en';
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicUser[]>([]);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await usersApi.search(query);
        setResults(res);
      } catch { setResults([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="pt-6 pb-8">
      <div className="mb-5">
        <h2 className="text-gray-900 dark:text-white" style={{ fontSize: 22, fontWeight: 700, margin: '0 0 2px' }}>
          Give Reflection
        </h2>
        <p className="text-sm text-gray-500 mt-0 mb-0">Search by name or username to send them a reflection</p>
      </div>

      <input
        type="text"
        placeholder="Search by name or @username…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-base text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none mb-3 box-border focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition"
      />
        {results.map((u) => (
          <button
            key={u.id}
            onClick={() => router.push(`/${locale}/give/${u.id}`)}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl mb-2 cursor-pointer text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <Avatar displayName={u.displayName} username={u.username} avatarUrl={u.avatarUrl} size={44} />
            <div>
              <div className="font-semibold text-base text-gray-800 dark:text-gray-200">{u.displayName || u.username}</div>
              <div className="text-sm text-gray-500">@{u.username} · {u.totalPoints} pts</div>
            </div>
          </button>
        ))}
      {query.length >= 2 && results.length === 0 && (
        <p className="text-sm text-gray-400 text-center mt-4">No one found with that name</p>
      )}
    </div>
  );
}
