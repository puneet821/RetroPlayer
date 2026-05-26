import { create } from 'zustand';

export type ThemeName = 'dark' | 'light' | 'neon';

interface ThemeState {
  activeTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  activeTheme: 'dark',
  setTheme: (theme) => {
    set({ activeTheme: theme });
    // Apply the theme to the body or root element
    document.body.className = `theme-${theme}`;
  },
}));
