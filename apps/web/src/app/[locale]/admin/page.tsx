'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { safetyApi, usersApi } from '@/lib/api';

const METRIC_TILES: Array<{ key: string; label: string; suffix?: string }> = [
  { key: 'totalUsers', label: 'Total users' },
  { key: 'newUsers7d', label: 'New this week' },
  { key: 'activeUsers7d', label: 'Weekly active' },
  { key: 'approvedReflections', label: 'Approved reflections' },
  { key: 'approvedReflections7d', label: 'Approved this week' },
  { key: 'pendingReflections', label: 'Pending review' },
  { key: 'approvalRate', label: 'Approval rate', suffix: '%' },
  { key: 'uniqueGivers7d', label: 'Unique givers (7d)' },
  { key: 'uniqueReceivers7d', label: 'Unique receivers (7d)' },
  { key: 'approvedReflectionsPerActiveUser7d', label: 'Approved / WAU' },
];

export default function AdminDashboardPage(): JSX.Element {
  const params = useParams<{ locale: string }>();
  const locale = params.locale || 'en';
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [openReports, setOpenReports] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([usersApi.getAdminMetrics(), safetyApi.getReports()])
      .then(([data, reports]) => {
        setMetrics(data);
        setOpenReports(reports.length);
      })
      .catch((err) => setError((err as Error).message));
  }, []);

  return (
    <div>
      {error && <p className="mb-4 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <Link
        href={`/${locale}/admin/moderation`}
        className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-danger/25 bg-danger/5 px-5 py-4 no-underline transition-colors hover:border-danger/40"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10">
            <AlertTriangle className="h-5 w-5 text-danger" />
          </div>
          <div>
            <p className="m-0 text-sm font-bold text-text-primary">
              {openReports === null ? 'Loading…' : `${openReports} open report${openReports === 1 ? '' : 's'}`}
            </p>
            <p className="m-0 text-xs text-text-muted">Review flagged reflections and accounts</p>
          </div>
        </div>
        <span className="shrink-0 text-xs font-semibold text-danger">Review →</span>
      </Link>

      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-text-muted">This week at a glance</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {METRIC_TILES.map((tile) => (
          <div key={tile.key} className="rounded-xl border border-border bg-surface p-3">
            <p className="m-0 text-[10px] font-semibold uppercase tracking-wide text-text-muted">{tile.label}</p>
            <p className="mb-0 mt-1 font-display text-xl font-bold text-text-primary">
              {metrics[tile.key] ?? 0}
              {tile.suffix ?? ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
