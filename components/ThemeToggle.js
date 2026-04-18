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
        background: 'var(--s3)',
        border: '1px solid var(--border)',
        color: 'var(--t2)',
      }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark
        ? <Sun  size={16} style={{ color: '#fbbf24' }} />
        : <Moon size={16} style={{ color: '#6366f1' }} />
      }
    </button>
  );
}
