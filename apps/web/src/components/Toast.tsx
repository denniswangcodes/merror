'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#111827',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: 24,
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        zIndex: 200,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}
    >
      {message}
    </div>
  );
}
