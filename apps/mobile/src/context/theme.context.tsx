import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const lightTheme = {
  dark: false, background: '#F6F7F9', surface: '#FFFFFF', raised: '#FFFFFF', border: '#E2E5EA',
  borderStrong: '#CDD2DA', text: '#1C1E22', textSecondary: '#4E535C', muted: '#808691', accent: '#BE5B8E',
};

export const darkTheme = {
  dark: true, background: '#1E1F22', surface: '#2B2D31', raised: '#313338', border: '#3C3E44',
  borderStrong: '#4E5058', text: '#F2F3F5', textSecondary: '#B5BAC1', muted: '#949BA4', accent: '#EC84AE',
};

/** Merror's brand mark colors — constant across light/dark, used for the logo and active-tab highlight. */
export const LOGO_START = '#6D5BFF';
export const LOGO_END = '#FF7A6B';

/** Purple → pink → orange brand gradient used for primary CTA buttons, constant across light/dark. */
export const BRAND_GRADIENT = ['#6D5BFF', '#EC4899', '#FF7A6B'] as const;

export type ThemeMode = 'light' | 'dark';
const STORAGE_KEY = 'merror_theme_mode';

interface ThemeContextValue {
  mode: ThemeMode;
  theme: typeof lightTheme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  theme: lightTheme,
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') setMode(saved);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  // Follow the system setting until the user explicitly picks a mode.
  useEffect(() => {
    if (!loaded) setMode(systemScheme === 'dark' ? 'dark' : 'light');
  }, [systemScheme, loaded]);

  const toggle = useCallback(() => {
    setMode((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      SecureStore.setItemAsync(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ mode, theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext).theme;
}

export function useThemeMode() {
  const { mode, toggle } = useContext(ThemeContext);
  return { mode, toggle };
}
