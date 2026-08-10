import { useColorScheme } from 'react-native';

export const lightTheme = {
  dark: false, background: '#F6F7F9', surface: '#FFFFFF', raised: '#FFFFFF', border: '#E2E5EA',
  borderStrong: '#CDD2DA', text: '#1C1E22', textSecondary: '#4E535C', muted: '#808691', accent: '#BE5B8E',
};

export const darkTheme = {
  dark: true, background: '#1E1F22', surface: '#2B2D31', raised: '#313338', border: '#3C3E44',
  borderStrong: '#4E5058', text: '#F2F3F5', textSecondary: '#B5BAC1', muted: '#949BA4', accent: '#EC84AE',
};

export function useAppTheme() {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}
