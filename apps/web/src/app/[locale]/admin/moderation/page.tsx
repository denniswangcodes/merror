'use client';

import { useEffect, useState } from 'react';
import { safetyApi, usersApi } from '@/lib/api';
import { useAuth } from '@/context/auth.context';
import { Button } from '@/components/ui/Button';

type Report = {
  id: string;
  reason: string;
  details?: string;
  createdAt: string;
  reporter?: { username: string };
  reportedUser?: { username: string };
  feedback?: { message: string; imageUrl?: string };
};

export default function ModerationPage() {
  const { user, loading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      Promise.all([safetyApi.getReports(), usersApi.getAdminMetrics()])
        .then(([items, data]) => { setReports(items as unknown as Report[]); setMetrics(data); })
        .catch((err) => setError((err as Error).message));
    }
  }, [user]);

  if (loading) return <p className="pt-8 text-center text-sm text-text-muted">Loading…</p>;
  if (!user || user.role !== 'ADMIN') return <div className="pt-8"><h1 className="font-display text-2xl font-bold text-text-primary">Not available</h1><p className="text-sm text-text-muted">Administrator access is required.</p></div>;

  const review = async (id: string, status: 'DISMISSED' | 'ACTIONED', action?: 'REMOVE_CONTENT' | 'SUSPEND_USER') => {
    try {
      await safetyApi.reviewReport(id, { status, action });
      setReports((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return <div className="pb-12 pt-6">
    <h1 className="m-0 font-display text-2xl font-bold text-text-primary">Moderation queue</h1>
    <p className="mb-6 mt-1 text-sm text-text-muted">Oldest open reports appear first.</p>
    <div className="mb-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {[['Weekly active', metrics.activeUsers7d], ['Approved / WAU', metrics.approvedReflectionsPerActiveUser7d], ['Approved this week', metrics.approvedReflections7d], ['Approval rate', `${metrics.approvalRate ?? 0}%`]].map(([label, value]) => <div key={label} className="rounded-xl border border-border bg-surface p-3"><p className="m-0 text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</p><p className="mb-0 mt-1 font-display text-xl font-bold text-text-primary">{value ?? 0}</p></div>)}
    </div>
    {error && <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
    {reports.length === 0 ? <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-text-muted">No open reports</p> : reports.map((report) => <article key={report.id} className="mb-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex flex-wrap justify-between gap-2"><strong className="text-sm text-text-primary">{report.reason.replaceAll('_', ' ')}</strong><span className="text-xs text-text-muted">{new Date(report.createdAt).toLocaleString()}</span></div>
      <p className="my-2 text-xs text-text-muted">Reported by @{report.reporter?.username || 'deleted'} · Account @{report.reportedUser?.username || 'none'}</p>
      {report.feedback?.message && <blockquote className="m-0 rounded-xl bg-background p-3 text-sm leading-6 text-text-secondary">“{report.feedback.message}”</blockquote>}
      {report.details && <p className="mb-0 mt-2 text-sm text-text-secondary">Reporter notes: {report.details}</p>}
      <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => review(report.id, 'DISMISSED')}>Dismiss</Button>{report.feedback && <Button size="sm" variant="destructive" onClick={() => review(report.id, 'ACTIONED', 'REMOVE_CONTENT')}>Remove content</Button>}{report.reportedUser && <Button size="sm" variant="destructive" onClick={() => review(report.id, 'ACTIONED', 'SUSPEND_USER')}>Suspend account</Button>}</div>
    </article>)}
  </div>;
}
