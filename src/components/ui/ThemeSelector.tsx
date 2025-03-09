import React from 'react';
import { Dropdown } from './Dropdown';
import { useTheme } from '../../hooks/useTheme';
import { Moon, Sun, Sunset, Leaf, Palette } from 'lucide-react';

export function ThemeSelector() {
  const { themes, currentTheme, setTheme } = useTheme();
  
  const themeOptions = themes.map(theme => {
    let icon;
    switch (theme.id) {
      case 'dark':
        icon = <Moon className="w-4 h-4 text-text" />;
        break;
      case 'midnight':
        icon = <Moon className="w-4 h-4 text-blue-400" />;
        break;
      case 'sunset':
        icon = <Sunset className="w-4 h-4 text-orange-400" />;
        break;
      case 'forest':
        icon = <Leaf className="w-4 h-4 text-green-400" />;
        break;
      default:
        icon = <Palette className="w-4 h-4 text-text invert-text" />;
    }
    
    return {
      value: theme.id,
      label: theme.name,
      icon
    };
  });
  
  return (
    <Dropdown
      options={themeOptions}
      value={currentTheme?.id || 'dark'}
      onChange={setTheme}
      placeholder="Select theme"
    />
  );
}