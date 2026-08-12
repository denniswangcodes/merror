'use client';

import { useState } from 'react';
import { Flag, ImagePlus, MoreHorizontal, ShieldBan, Trash2, X } from 'lucide-react';
import { feedbackApi, safetyApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/auth.context';

const REASONS = [
  ['HARASSMENT', 'Harassment or bullying'],
  ['HATE_SPEECH', 'Hate speech'],
  ['SEXUAL_CONTENT', 'Sexual content'],
  ['VIOLENCE', 'Violence or threats'],
  ['SPAM', 'Spam or manipulation'],
  ['IMPERSONATION', 'Impersonation'],
  ['PRIVACY', 'Privacy concern'],
  ['OTHER', 'Something else'],
] as const;

export function SafetyMenu({ feedbackId, userId, canDelete = false, canEditPhoto = false, onDeleted, onBlocked, onEditPhoto }: { feedbackId?: string; userId?: string; canDelete?: boolean; canEditPhoto?: boolean; onDeleted?: () => void; onBlocked?: () => void; onEditPhoto?: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState('HARASSMENT');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const submitReport = async () => {
    setBusy(true);
    try {
      await safetyApi.report({ feedbackId, reportedUserId: userId, reason, details: details.trim() || undefined });
      setMessage('Report submitted. Thank you for helping keep Merror safe.');
      setReporting(false);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const block = async () => {
    if (!userId || !window.confirm('Block this person? You will no longer see or interact with each other.')) return;
    setBusy(true);
    try {
      await safetyApi.block(userId);
      setMessage('User blocked');
      onBlocked?.();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const removeReflection = async () => {
    if (!feedbackId || !window.confirm('Delete this reflection? This cannot be undone.')) return;
    setBusy(true);
    try {
      await feedbackApi.remove(feedbackId);
      setOpen(false);
      onDeleted?.();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative ml-auto">
      <button onClick={() => setOpen((value) => !value)} aria-label="Safety options" className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-background hover:text-text-primary">
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute top-full right-0 z-30 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-surface-raised p-1 shadow-card-hover">
          <button onClick={() => { setReporting(true); setOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-text-secondary hover:bg-background"><Flag className="h-3.5 w-3.5" /> Report</button>
          {canEditPhoto && <button onClick={() => { setOpen(false); onEditPhoto?.(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-text-secondary hover:bg-background"><ImagePlus className="h-3.5 w-3.5" /> Edit photo</button>}
          {userId && userId !== user?.id && <button disabled={busy} onClick={block} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-danger hover:bg-danger/10"><ShieldBan className="h-3.5 w-3.5" /> Block</button>}
          {canDelete && <button disabled={busy} onClick={removeReflection} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-danger hover:bg-danger/10"><Trash2 className="h-3.5 w-3.5" /> Delete</button>}
        </div>
      )}

      {reporting && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label="Report content">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between"><h2 className="m-0 font-display text-lg font-bold text-text-primary">Report a concern</h2><button onClick={() => setReporting(false)} aria-label="Close"><X className="h-5 w-5 text-text-muted" /></button></div>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Reason</label>
            <select value={reason} onChange={(event) => setReason(event.target.value)} className="mb-4 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none">
              {REASONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Details (optional)</label>
            <textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={500} rows={4} className="mb-4 w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none" placeholder="Tell us what happened" />
            <div className="flex justify-end gap-2"><Button variant="secondary" size="sm" onClick={() => setReporting(false)}>Cancel</Button><Button size="sm" loading={busy} onClick={submitReport}>Submit report</Button></div>
          </div>
        </div>
      )}
      {message && <div className="fixed bottom-20 left-1/2 z-[350] -translate-x-1/2 rounded-xl bg-text-primary px-4 py-2 text-xs font-semibold text-surface shadow-xl" onClick={() => setMessage('')}>{message}</div>}
    </div>
  );
}
