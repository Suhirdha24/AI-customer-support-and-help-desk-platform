import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'nexusdesk-theme';

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyThemeClass = (resolved: 'light' | 'dark') => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  return 'system';
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialTheme = getInitialTheme();
  const initialResolved =
    initialTheme === 'system' ? getSystemTheme() : initialTheme;

  applyThemeClass(initialResolved);

  // Listen to system theme changes if set to system
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      const currentTheme = get().theme;
      if (currentTheme === 'system') {
        const nextResolved = e.matches ? 'dark' : 'light';
        applyThemeClass(nextResolved);
        set({ resolvedTheme: nextResolved });
      }
    });
  }

  return {
    theme: initialTheme,
    resolvedTheme: initialResolved,
    setTheme: (theme: ThemeMode) => {
      const resolved = theme === 'system' ? getSystemTheme() : theme;
      localStorage.setItem(STORAGE_KEY, theme);
      applyThemeClass(resolved);
      set({ theme, resolvedTheme: resolved });
    },
    toggleTheme: () => {
      const currentResolved = get().resolvedTheme;
      const nextTheme = currentResolved === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, nextTheme);
      applyThemeClass(nextTheme);
      set({ theme: nextTheme, resolvedTheme: nextTheme });
    },
  };
});
