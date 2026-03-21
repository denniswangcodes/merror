import type { AuthTokens, PublicUser } from '@merror/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ─── Token cache (in-memory + localStorage fallback) ─────────────────────────
let _accessToken: string | null = null;
let _refreshToken: string | null = null;

function safeLocalStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function setTokens(access: string, refresh: string) {
  _accessToken = access;
  _refreshToken = refresh;
  const ls = safeLocalStorage();
  if (ls) {
    try {
      ls.setItem('merror_at', access);
      ls.setItem('merror_rt', refresh);
    } catch { /* Safari private mode */ }
  }
}

export function clearTokens() {
  _accessToken = null;
  _refreshToken = null;
  const ls = safeLocalStorage();
  if (ls) {
    try {
      ls.removeItem('merror_at');
      ls.removeItem('merror_rt');
    } catch { /* noop */ }
  }
}

function getStoredTokens() {
  if (_accessToken) return { accessToken: _accessToken, refreshToken: _refreshToken };
  const ls = safeLocalStorage();
  if (ls) {
    try {
      const at = ls.getItem('merror_at');
      const rt = ls.getItem('merror_rt');
      if (at) {
        _accessToken = at;
        _refreshToken = rt;
        return { accessToken: at, refreshToken: rt };
      }
    } catch { /* noop */ }
  }
  return { accessToken: null, refreshToken: null };
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const { refreshToken } = getStoredTokens();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Refresh-Token': refreshToken,
      },
    });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    const data: AuthTokens = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

const AUTH_PATHS = ['/api/auth/login', '/api/auth/signup', '/api/auth/logout', '/api/auth/refresh'];

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { accessToken } = getStoredTokens();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  let res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  // Auto-refresh on 401 — skip for auth endpoints (their 401s mean bad credentials, not expired tokens)
  if (res.status === 401 && !AUTH_PATHS.includes(path)) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = doRefresh().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }
    const refreshed = await refreshPromise!;
    if (refreshed) {
      const { accessToken: newAt } = getStoredTokens();
      headers['Authorization'] = `Bearer ${newAt}`;
      res = await fetch(`${API_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers,
      });
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (data: { email: string; password: string; username: string; displayName?: string }) =>
    apiFetch<AuthTokens>('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    apiFetch<AuthTokens>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  logout: () => apiFetch('/api/auth/logout', { method: 'POST' }),

  me: () => apiFetch<PublicUser>('/api/auth/me'),
};

// ─── Users API ────────────────────────────────────────────────────────────────
export const usersApi = {
  search: (q: string) => apiFetch<PublicUser[]>(`/api/users/search?q=${encodeURIComponent(q)}`),
  getById: (id: string) => apiFetch<PublicUser>(`/api/users/${id}`),
  getByUsername: (username: string) => apiFetch<PublicUser>(`/api/users/by-username/${username}`),
  getByQr: (qrCode: string) => apiFetch<PublicUser>(`/api/users/qr/${qrCode}`),
  updateProfile: (data: Partial<PublicUser>) =>
    apiFetch<PublicUser>('/api/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
};

// ─── Feedback API ─────────────────────────────────────────────────────────────
export const feedbackApi = {
  getFeed: (page = 1) => apiFetch(`/api/feedback/feed?page=${page}&limit=20`),
  create: (data: { receiverId: string; type: string; message: string; isPublic: boolean }) =>
    apiFetch('/api/feedback', { method: 'POST', body: JSON.stringify(data) }),
  getReceived: (page = 1) => apiFetch(`/api/feedback/received?page=${page}&limit=20`),
  getGiven: (page = 1) => apiFetch(`/api/feedback/given?page=${page}&limit=20`),
};

// ─── Friends API ──────────────────────────────────────────────────────────────
export const friendsApi = {
  getFriends: () => apiFetch('/api/friends'),
  getPending: () => apiFetch('/api/friends/pending'),
  sendRequest: (targetUserId: string) =>
    apiFetch('/api/friends/request', { method: 'POST', body: JSON.stringify({ targetUserId }) }),
  accept: (id: string) => apiFetch(`/api/friends/${id}/accept`, { method: 'PATCH' }),
  remove: (id: string) => apiFetch(`/api/friends/${id}`, { method: 'DELETE' }),
};
