'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Avatar } from '@/components/Avatar';
import { usersApi } from '@/lib/api';
import type { PublicUser } from '@merror/shared';

export default function ScanPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale || 'en';
  const router = useRouter();
  const [mode, setMode] = useState<'search' | 'scan'>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicUser[]>([]);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success'>('idle');
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<unknown>(null);

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

  // Start QR scanner when in scan mode
  useEffect(() => {
    if (mode !== 'scan') return;

    let scanner: { clear: () => Promise<void> } | null = null;

    const startScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        const s = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 200, height: 200 } },
          false,
        );
        s.render(
          async (decodedText: string) => {
            setScanState('success');
            s.clear();
            // Try to resolve QR code to user
            try {
              const user = await usersApi.getByQr(decodedText);
              router.push(`/${locale}/give/${user.id}`);
            } catch {
              // Fallback: treat as username
              try {
                const user = await usersApi.getByUsername(decodedText);
                router.push(`/${locale}/give/${user.id}`);
              } catch {
                setScanState('idle');
              }
            }
          },
          () => { /* ignore errors */ },
        );
        scanner = s;
        html5QrRef.current = s;
      } catch { /* html5-qrcode not available */ }
    };

    startScanner();
    return () => {
      scanner?.clear().catch(() => {});
    };
  }, [mode, locale, router]);

  return (
    <div className="px-4 py-5">
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, margin: '0 0 4px', color: '#111827' }}>
        Find someone
      </h2>
      <p className="text-[13px] text-gray-500 mt-0 mb-5">Scan their QR code or search by name</p>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-5">
        {(['search', 'scan'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold cursor-pointer transition-colors"
            style={{
              border: `2px solid ${mode === m ? '#4F46E5' : '#E5E7EB'}`,
              background: mode === m ? '#EEF2FF' : '#fff',
              color: mode === m ? '#4F46E5' : '#4B5563',
            }}
          >
            {m === 'search' ? 'Search' : 'Scan QR'}
          </button>
        ))}
      </div>

      {mode === 'search' ? (
        <>
          <input
            type="text"
            placeholder="Search by name or @username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3.5 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 outline-none mb-3 box-border"
          />
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => router.push(`/${locale}/give/${user.id}`)}
              className="w-full flex items-center gap-3 px-3.5 py-3 bg-white border border-gray-200 rounded-xl mb-2 cursor-pointer text-left hover:bg-gray-50"
            >
              <Avatar displayName={user.displayName} username={user.username} avatarUrl={user.avatarUrl} size={40} />
              <div>
                <div className="font-semibold text-sm text-gray-800">{user.displayName || user.username}</div>
                <div className="text-xs text-gray-500">@{user.username} · {user.totalPoints} pts</div>
              </div>
            </button>
          ))}
          {query.length >= 2 && results.length === 0 && (
            <p className="text-[13px] text-gray-400 text-center mt-5">No one found with that name</p>
          )}
        </>
      ) : (
        <div className="text-center">
          {scanState === 'success' ? (
            <div className="bg-gray-100 rounded-[20px] p-6 mb-4 flex flex-col items-center justify-center min-h-[220px] border-2 border-dashed border-gray-300">
              <div className="text-4xl mb-2">✓</div>
              <p className="font-semibold text-green-700">QR Code scanned!</p>
              <p className="text-[13px] text-gray-500">Loading profile...</p>
            </div>
          ) : (
            <div
              id="qr-reader"
              ref={scannerRef}
              className="rounded-[20px] overflow-hidden border-2 border-dashed border-gray-300"
            />
          )}
          <p className="text-xs text-gray-400 mt-2">Point your camera at someone&apos;s Merror QR code</p>
        </div>
      )}
    </div>
  );
}
