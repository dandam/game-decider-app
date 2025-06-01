import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useTheme = (defaultTheme: Theme = 'system') => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(
    defaultTheme === 'system' ? getSystemTheme() : defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'system') {
      root.removeAttribute('data-theme');
      setResolvedTheme(getSystemTheme());
    } else {
      root.setAttribute('data-theme', theme);
      setResolvedTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setResolvedTheme(getSystemTheme());

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  return {
    theme,
    setTheme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark'
  };
}; 