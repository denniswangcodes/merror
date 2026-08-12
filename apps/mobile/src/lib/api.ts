import * as SecureStore from 'expo-secure-store';
import type { CommentItem } from '@merror/shared';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

const KEYS = { access: 'merror_at', refresh: 'merror_rt' };

let _accessToken: string | null = null;
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export async function getAccessToken(): Promise<string | null> {
  if (_accessToken) return _accessToken;
  const stored = await SecureStore.getItemAsync(KEYS.access);
  if (stored) _accessToken = stored;
  return _accessToken;
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.refresh);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  _accessToken = accessToken;
  await SecureStore.setItemAsync(KEYS.access, accessToken);
  await SecureStore.setItemAsync(KEYS.refresh, refreshToken);
}

export async function clearTokens(): Promise<void> {
  _accessToken = null;
  await SecureStore.deleteItemAsync(KEYS.access);
  await SecureStore.deleteItemAsync(KEYS.refresh);
}

async function doRefresh(): Promise<string | null> {
  try {
    const rt = await getRefreshToken();
    if (!rt) return null;
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Refresh-Token': rt },
    });
    if (!res.ok) { await clearTokens(); return null; }
    const data = await res.json();
    await setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    await clearTokens();
    return null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing) return refreshPromise;
  isRefreshing = true;
  refreshPromise = doRefresh().finally(() => { isRefreshing = false; refreshPromise = null; });
  return refreshPromise;
}

export async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const at = await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string>),
  };
  if (at) headers['Authorization'] = `Bearer ${at}`;

  let res = await fetch(`${API_URL}${path}`, { ...opts, headers });

  if (res.status === 401) {
    const newAt = await refreshAccessToken();
    if (newAt) {
      headers['Authorization'] = `Bearer ${newAt}`;
      res = await fetch(`${API_URL}${path}`, { ...opts, headers });
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `API error ${res.status}`);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

// Auth
export const authApi = {
  signup: (email: string, password: string, username: string, displayName?: string) =>
    apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, displayName }),
    }),
  login: (email: string, password: string) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => apiFetch('/api/auth/me'),
  logout: () => apiFetch('/api/auth/logout', { method: 'POST' }),
  deleteAccount: (password: string) => apiFetch('/api/auth/account', { method: 'DELETE', body: JSON.stringify({ password }) }),
};

// Users
export const usersApi = {
  search: (q: string) => apiFetch(`/api/users/search?q=${encodeURIComponent(q)}`),
  getById: (id: string) => apiFetch(`/api/users/${id}`),
  getByUsername: (username: string) => apiFetch(`/api/users/by-username/${username}`),
  getByQr: (qrCode: string) => apiFetch(`/api/users/qr/${encodeURIComponent(qrCode)}`),
  updateProfile: (data: { displayName?: string; bio?: string }) =>
    apiFetch('/api/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
};

// Feedback
export const feedbackApi = {
  getFeed: (page = 1, limit = 20) => apiFetch(`/api/feedback/feed?page=${page}&limit=${limit}`),
  getReceived: () => apiFetch('/api/feedback/received'),
  getGiven: () => apiFetch('/api/feedback/given'),
  approve: (id: string) => apiFetch(`/api/feedback/${id}/approve`, { method: 'PATCH' }),
  reject: (id: string) => apiFetch(`/api/feedback/${id}/reject`, { method: 'PATCH' }),
  toggleLike: (id: string) => apiFetch<{ liked: boolean; likeCount: number }>(`/api/feedback/${id}/like`, { method: 'POST' }),
  getComments: (id: string) => apiFetch<CommentItem[]>(`/api/feedback/${id}/comments`),
  addComment: (id: string, message: string) => apiFetch<CommentItem>(`/api/feedback/${id}/comments`, { method: 'POST', body: JSON.stringify({ message }) }),
  create: (receiverId: string, type: string, message: string, isPublic: boolean, imageUrl?: string) =>
    apiFetch('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({ receiverId, type, message, isPublic, ...(imageUrl ? { imageUrl } : {}) }),
    }),
};

// Friends
export const friendsApi = {
  getFriends: () => apiFetch('/api/friends'),
  getPending: () => apiFetch('/api/friends/pending'),
  sendRequest: (targetUserId: string) =>
    apiFetch('/api/friends/request', { method: 'POST', body: JSON.stringify({ targetUserId }) }),
  acceptRequest: (friendshipId: string) =>
    apiFetch(`/api/friends/${friendshipId}/accept`, { method: 'PATCH' }),
  remove: (friendshipId: string) => apiFetch(`/api/friends/${friendshipId}`, { method: 'DELETE' }),
};

// Notifications
export const notificationsApi = {
  getAll: () => apiFetch('/api/notifications'),
  getUnreadCount: () => apiFetch<{ count: number }>('/api/notifications/unread-count'),
  markRead: (id: string) => apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiFetch('/api/notifications/read-all', { method: 'PATCH' }),
  remove: (id: string) => apiFetch(`/api/notifications/${id}`, { method: 'DELETE' }),
  clearAll: () => apiFetch('/api/notifications', { method: 'DELETE' }),
};

export const safetyApi = {
  report: (data: { feedbackId?: string; reportedUserId?: string; reason: string; details?: string }) =>
    apiFetch('/api/safety/reports', { method: 'POST', body: JSON.stringify(data) }),
  block: (userId: string) => apiFetch(`/api/safety/blocks/${userId}`, { method: 'POST' }),
  unblock: (userId: string) => apiFetch(`/api/safety/blocks/${userId}`, { method: 'DELETE' }),
};
