'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Default to 'light' — the inline script in layout.js already set the
  // correct data-theme on <html> before React hydrates, so there's no flash.
  // We initialise state to match whatever the html element already has.
  const [theme, setTheme] = useState(() => {
    // During SSR this runs on server — return 'light' as the default.
    // On the client the inline script has already set data-theme correctly,
    // so we read it here to stay in sync.
    if (typeof window !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') || 'light';
    }
    return 'light';
  });

  // On mount, sync state with whatever the inline script set.
  // This handles the case where localStorage had 'dark' saved.
  useEffect(() => {
    const saved = localStorage.getItem('nova-theme') || 'light';
    if (saved !== theme) {
      setTheme(saved);
    }
    // Always make sure the attribute is set correctly
    document.documentElement.setAttribute('data-theme', saved);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('nova-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const setThemeExplicit = (t) => {
    setTheme(t);
    localStorage.setItem('nova-theme', t);
    document.documentElement.setAttribute('data-theme', t);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      setTheme: setThemeExplicit,
      isDark:  theme === 'dark',
      isLight: theme === 'light',
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
