// Theme state now lives in a context (so the user can toggle dark mode independent of the
// system setting). Re-exported here so existing `from '../../src/lib/theme'` imports keep working.
export { lightTheme, darkTheme, LOGO_START, LOGO_END, useAppTheme, useThemeMode, ThemeProvider } from '../context/theme.context';
export type { ThemeMode } from '../context/theme.context';
