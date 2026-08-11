'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, X } from 'lucide-react';
import { feedbackApi, notificationsApi } from '@/lib/api';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/ui/Button';
import { formatReflectionDate, type NotificationItem } from '@merror/shared';

function copyFor(notification: NotificationItem) {
  const name = notification.fromUser?.displayName || notification.fromUser?.username || 'Someone';
  if (notification.type === 'FRIEND_REQUEST') return `${name} sent you a friend request`;
  if (notification.type === 'FRIEND_ACCEPTED') return `${name} accepted your friend request`;
  if (notification.type === 'FEEDBACK_APPROVED') return `${name} approved your reflection`;
  if (notification.type === 'FEEDBACK_REJECTED') return `${name} declined your reflection`;
  if (notification.type === 'FEEDBACK_LIKED') return `${name} liked your reflection`;
  if (notification.type === 'FEEDBACK_COMMENTED') return `${name} commented on your reflection`;
  return `${name} sent you a reflection to review`;
}

export function NotificationMenu({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [count, setCount] = useState(0);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const wrapper = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try {
      const [notifications, unread] = await Promise.all([notificationsApi.getAll(), notificationsApi.getUnreadCount()]);
      setItems(notifications);
      setCount(unread.count);
    } catch { /* signed-out and transient failures stay quiet */ }
  }, []);

  useEffect(() => {
    refresh();
    const interval = window.setInterval(refresh, 30000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const toggle = () => {
    setOpen((value) => !value);
    if (!open) refresh();
  };

  const review = async (notification: NotificationItem, approve: boolean) => {
    if (!notification.referenceId) return;
    setReviewing(notification.id);
    try {
      await (approve ? feedbackApi.approve(notification.referenceId) : feedbackApi.reject(notification.referenceId));
      await refresh();
    } finally {
      setReviewing(null);
    }
  };

  return (
    <div ref={wrapper} className="relative">
      <button onClick={toggle} className="relative flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-background hover:text-text-primary" aria-label={`Notifications${count ? `, ${count} unread` : ''}`} aria-expanded={open}>
        <Bell className="h-[18px] w-[18px]" />
        {count > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-danger px-1 text-center text-[9px] font-bold leading-4 text-white">{count > 9 ? '9+' : count}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[200] mt-2 w-[360px] overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-card-hover dark:shadow-card-hover-dark">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="m-0 font-display text-base font-bold text-text-primary">Notifications</h2>
            {count > 0 && <button onClick={async () => { await notificationsApi.markAllRead(); await refresh(); }} className="text-[11px] font-semibold text-accent">Mark all read</button>}
          </div>
          <div className="max-h-[440px] overflow-y-auto p-2">
            {items.length === 0 ? <p className="m-0 px-4 py-10 text-center text-sm text-text-muted">You’re all caught up.</p> : items.map((item) => {
              const isReview = item.type === 'FEEDBACK_RECEIVED' && !item.read;
              const content = (
                <div className={`rounded-xl px-3 py-3 ${item.read ? '' : 'bg-accent/[0.08]'}`}>
                  <div className="flex gap-3">
                    <Avatar displayName={item.fromUser?.displayName ?? null} username={item.fromUser?.username ?? '?'} avatarUrl={item.fromUser?.avatarUrl} size={38} />
                    <div className="min-w-0 flex-1">
                      <p className="m-0 text-[13px] leading-5 text-text-primary">{copyFor(item)}</p>
                      {isReview && item.feedback && (
                        <div className="mt-1.5 rounded-lg border border-border bg-background/70 px-2.5 py-2">
                          <p className="m-0 line-clamp-3 text-xs leading-5 text-text-secondary">“{item.feedback.message}”</p>
                        </div>
                      )}
                      <p className="m-0 mt-0.5 text-[10px] font-medium tabular-nums text-text-muted">{formatReflectionDate(item.createdAt)}</p>
                    </div>
                    {!item.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />}
                  </div>
                  {isReview && (
                    <div className="ml-[50px] mt-2 flex gap-2">
                      <Button size="sm" loading={reviewing === item.id} onClick={() => review(item, true)}><Check className="h-3 w-3" /> Approve</Button>
                      <Button size="sm" variant="secondary" disabled={reviewing === item.id} onClick={() => review(item, false)}><X className="h-3 w-3" /> Reject</Button>
                    </div>
                  )}
                </div>
              );
              if (item.type === 'FRIEND_REQUEST') {
                return <Link key={item.id} href={`/${locale}/friends`} onClick={() => notificationsApi.markRead(item.id).then(refresh)} className="block no-underline">{content}</Link>;
              }
              if ((item.type === 'FEEDBACK_LIKED' || item.type === 'FEEDBACK_COMMENTED') && item.referenceId) {
                return <Link key={item.id} href={`/${locale}/reflection/${item.referenceId}`} onClick={() => notificationsApi.markRead(item.id).then(refresh)} className="block no-underline">{content}</Link>;
              }
              return <div key={item.id}>{content}</div>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
