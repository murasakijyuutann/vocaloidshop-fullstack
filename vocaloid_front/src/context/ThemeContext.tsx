// src/context/ThemeContext.tsx
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { ThemeContext, type ThemeMode } from './ThemeContextBase';
import { lightTheme, darkTheme } from '../styles/theme';

const STORAGE_KEY = 'themeMode';

export const ThemeModeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [mode, setMode] = React.useState<ThemeMode>(() => {
    const saved = typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) : null;
    if (saved === 'dark' || saved === 'light') return saved;
    // Prefer system if available
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
      // Also reflect on html data attribute for raw CSS hooks if needed
      document.documentElement.setAttribute('data-theme', mode);
    } catch {
      // ignore
    }
  }, [mode]);

  const toggle = React.useCallback(() => setMode((m) => (m === 'light' ? 'dark' : 'light')), []);

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggle }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
