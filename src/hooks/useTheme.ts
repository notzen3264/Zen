import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/settings';
import themeData from '../data/themes.json';

export interface Theme {
  id: string;
  name: string;
  colors: {
    crust: string;
    base: string;
    surface0: string;
    text: string;
    subtext0: string;
    blue: string;
  };
  wallpaper: string;
}

export function useTheme() {
  const { themeId, setThemeId } = useSettingsStore();
  const [themes] = useState<Theme[]>(themeData.themes);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const theme = themes.find(t => t.id === themeId) || themes[0];
    setCurrentTheme(theme);
    
    // Apply theme CSS variables
    document.documentElement.style.setProperty('--theme-crust', theme.colors.crust);
    document.documentElement.style.setProperty('--theme-base', theme.colors.base);
    document.documentElement.style.setProperty('--theme-surface0', theme.colors.surface0);
    document.documentElement.style.setProperty('--theme-text', theme.colors.text);
    document.documentElement.style.setProperty('--theme-subtext0', theme.colors.subtext0);
    document.documentElement.style.setProperty('--theme-blue', theme.colors.blue);
    
  }, [themeId, themes]);

  const setTheme = (id: string) => {
    setThemeId(id);
  };

  return { themes, currentTheme, setTheme };
}