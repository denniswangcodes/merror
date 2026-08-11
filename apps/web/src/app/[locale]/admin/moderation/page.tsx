'use client';

import { useEffect, useState } from 'react';
import { safetyApi } from '@/lib/api';
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

export default function ModerationPage(): JSX.Element {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    safetyApi
      .getReports()
      .then((items) => setReports(items as unknown as Report[]))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const review = async (id: string, status: 'DISMISSED' | 'ACTIONED', action?: 'REMOVE_CONTENT' | 'SUSPEND_USER') => {
    try {
      await safetyApi.reviewReport(id, { status, action });
      setReports((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <p className="mb-5 text-sm text-text-muted">Oldest open reports appear first.</p>
      {error && <p className="mb-4 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      {loading ? (
        <p className="py-12 text-center text-sm text-text-muted">Loading…</p>
      ) : reports.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-text-muted">No open reports</p>
      ) : (
        reports.map((report) => (
          <article key={report.id} className="mb-3 rounded-2xl border border-border bg-surface p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <strong className="text-sm text-text-primary">{report.reason.replaceAll('_', ' ')}</strong>
              <span className="text-xs text-text-muted">{new Date(report.createdAt).toLocaleString()}</span>
            </div>
            <p className="my-2 text-xs text-text-muted">
              Reported by @{report.reporter?.username || 'deleted'} · Account @{report.reportedUser?.username || 'none'}
            </p>
            {report.feedback?.message && (
              <blockquote className="m-0 rounded-xl bg-background p-3 text-sm leading-6 text-text-secondary">“{report.feedback.message}”</blockquote>
            )}
            {report.details && <p className="mb-0 mt-2 text-sm text-text-secondary">Reporter notes: {report.details}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => review(report.id, 'DISMISSED')}>Dismiss</Button>
              {report.feedback && <Button size="sm" variant="destructive" onClick={() => review(report.id, 'ACTIONED', 'REMOVE_CONTENT')}>Remove content</Button>}
              {report.reportedUser && <Button size="sm" variant="destructive" onClick={() => review(report.id, 'ACTIONED', 'SUSPEND_USER')}>Suspend account</Button>}
            </div>
          </article>
        ))
      )}
    </div>
  );
}
