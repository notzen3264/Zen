import React from 'react';
import { Dropdown } from './Dropdown';
import { useTheme } from '../../hooks/useTheme';
import { Moon, Sunset, Leaf, Palette, Coffee, CupSoda, MountainSnow, Flower, TreePine, Shrub, History, Sun } from 'lucide-react';

export function ThemeSelector() {
  const { themes, currentTheme, setTheme } = useTheme();

  const themeOptions = themes.map(theme => {
    let icon;
    switch (theme.id) {
      case 'mocha':
        icon = <Coffee className="w-4 h-4" style={{ color: theme.colors.blue }} />;
        break;
      case 'macchiato':
        icon = <Coffee className="w-4 h-4" style={{ color: theme.colors.blue }} />;
        break;
      case 'frappe':
        icon = <CupSoda className="w-4 h-4" style={{ color: theme.colors.blue }} />;
        break;
      case 'latte':
        icon = <Coffee className="w-4 h-4" style={{ color: theme.colors.blue }} />;
        break;
      case 'nord':
        icon = <MountainSnow className="w-4 h-4" style={{ color: theme.colors.blue }} />;
        break;
      case 'rose':
        icon = <Flower className="w-4 h-4" style={{ color: theme.colors.blue }} />;
        break;
      case 'moss':
        icon = <Shrub className="w-4 h-4" style={{ color: theme.colors.blue }} />;
        break;
      case 'rose-pine':
        icon = <TreePine className="w-4 h-4" style={{ color: theme.colors.blue }} />;
        break;
      case 'gruvbox':
        icon = <History className="w-4 h-4" style={{ color: theme.colors.blue }} />;
        break;
      case 'night':
        icon = <Moon className="w-4 h-4" style={{ color: theme.colors.blue }} />;
        break;
      case 'sunny':
        icon = <Sun className="w-4 h-4" style={{ color: theme.colors.blue }} />;
        break;
      default:
        icon = <Palette className="w-4 h-4" style={{ color: theme.colors.blue }} />;
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