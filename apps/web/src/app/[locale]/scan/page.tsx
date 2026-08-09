'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/auth.context';
import { usersApi } from '@/lib/api';
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
        <h2 className="font-display text-[22px] font-bold text-text-primary m-0 mb-0.5">
          Give Reflection
        </h2>
        <p className="text-sm text-text-muted mt-0 mb-0">Search by name or username to send them a reflection</p>
      </div>

      <Input
        type="text"
        placeholder="Search by name or @username…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-3"
      />

      {results.map((u) => (
        <button
          key={u.id}
          onClick={() => router.push(`/${locale}/give/${u.id}`)}
          className="w-full flex items-center gap-3 px-4 py-3.5 bg-surface border border-border rounded-xl mb-2 cursor-pointer text-left hover:border-border-strong transition-colors"
        >
          <Avatar displayName={u.displayName} username={u.username} avatarUrl={u.avatarUrl} size={44} />
          <div>
            <div className="font-semibold text-base text-text-primary">{u.displayName || u.username}</div>
            <div className="text-sm text-text-muted">@{u.username} · {u.totalPoints} pts</div>
          </div>
        </button>
      ))}

      {query.length >= 2 && results.length === 0 && (
        <div className="flex flex-col items-center gap-2 text-center py-10">
          <Search className="h-5 w-5 text-text-muted" />
          <p className="text-sm text-text-muted">No one found with that name</p>
        </div>
      )}
    </div>
  );
}
