import React from 'react';
import { Palette } from 'lucide-react';
import { useThemeStore, type ThemeName } from '../stores/useThemeStore';
import './ThemePicker.css';

const themes: { id: ThemeName; label: string; color: string }[] = [
  { id: 'dark', label: 'Dark', color: '#121212' },
  { id: 'light', label: 'Light', color: '#f5f5f7' },
  { id: 'neon', label: 'Neon', color: '#09090b' },
];

const ThemePicker: React.FC = () => {
  const { activeTheme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="theme-picker-container">
      <button 
        className="theme-toggle-btn glass"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle themes"
      >
        <Palette size={20} />
      </button>

      {isOpen && (
        <div className="theme-menu glass-panel">
          {themes.map((theme) => (
            <button
              key={theme.id}
              className={`theme-option ${activeTheme === theme.id ? 'active' : ''}`}
              onClick={() => {
                setTheme(theme.id);
                setIsOpen(false);
              }}
            >
              <div 
                className="theme-color-preview" 
                style={{ background: theme.color }}
              />
              {theme.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemePicker;
