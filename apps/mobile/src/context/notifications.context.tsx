import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { AppState } from 'react-native';
import { notificationsApi, friendsApi } from '../lib/api';
import { useAuth } from './auth.context';

interface NotificationsContextType {
  unreadCount: number;
  pendingFriendCount: number;
  refresh: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType>({
  unreadCount: 0,
  pendingFriendCount: 0,
  refresh: async () => {},
});

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingFriendCount, setPendingFriendCount] = useState(0);
  const appState = useRef(AppState.currentState);

  const refresh = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      setPendingFriendCount(0);
      return;
    }
    try {
      const [{ count }, pending] = await Promise.all([
        notificationsApi.getUnreadCount(),
        friendsApi.getPending() as Promise<unknown[]>,
      ]);
      setUnreadCount(count);
      setPendingFriendCount((pending as unknown[]).length);
    } catch {
      // noop
    }
  }, [user]);

  // Refresh when user changes (login/logout)
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Refresh when app comes back to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        refresh();
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [refresh]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, pendingFriendCount, refresh }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
