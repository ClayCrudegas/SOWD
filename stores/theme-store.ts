import { create } from 'zustand';
import { getItem, setItem, storageKeys } from '@/lib/storage';
import { ColorSchemeName } from 'react-native';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeStore {
  theme: Theme;
  activeColorScheme: ColorSchemeName;
  isLoaded: boolean;
  setTheme: (theme: Theme) => void;
  setActiveColorScheme: (scheme: ColorSchemeName) => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'auto',
  activeColorScheme: 'light',
  isLoaded: false,
  setTheme: async (theme) => {
    await setItem(storageKeys.THEME, theme);
    set({ theme });
  },
  setActiveColorScheme: (scheme) => set({ activeColorScheme: scheme }),
  loadTheme: async () => {
    const savedTheme = await getItem<Theme>(storageKeys.THEME);
    set({ theme: savedTheme || 'auto', isLoaded: true });
  },
}));
