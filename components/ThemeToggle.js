'use client';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all ${className}`}
      style={{
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.1)',
        color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
      }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark
        ? <Sun size={16} style={{ color: '#fbbf24' }} />
        : <Moon size={16} style={{ color: '#6366f1' }} />
      }
    </button>
  );
}
