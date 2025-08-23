import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Safe localStorage operations with error handling
const safeStorage = {
  getItem: (key: string, fallback: string = 'system'): string => {
    try {
      return localStorage.getItem(key) || fallback;
    } catch (error) {
      console.warn(`Failed to read from localStorage: ${error}`);
      return fallback;
    }
  },
  
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to write to localStorage: ${error}`);
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove from localStorage: ${error}`);
    }
  }
};

// Get system theme preference
const getSystemTheme = (): 'light' | 'dark' => {
  try {
    if (typeof window === 'undefined') {return 'light';}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch (error) {
    console.warn(`Failed to detect system theme: ${error}`);
    return 'light';
  }
};

// Resolve theme preference to actual theme
const resolveTheme = (themePreference: Theme): 'light' | 'dark' => {
  if (themePreference === 'system') {
    return getSystemTheme();
  }
  return themePreference === 'dark' ? 'dark' : 'light';
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme
  useEffect(() => {
    // Check for saved preference
    const savedTheme = safeStorage.getItem('app-theme', 'system') as Theme;
    
    // Migrate from old keys
    const legacyTheme = safeStorage.getItem('theme', '');
    if (legacyTheme && ['light', 'dark'].includes(legacyTheme)) {
      safeStorage.setItem('app-theme', legacyTheme);
      safeStorage.removeItem('theme');
      setThemeState(legacyTheme as Theme);
    } else if (['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme);
    } else {
      // Default to system preference
      setThemeState('system');
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);

    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    
    // Save preference
    safeStorage.setItem('app-theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') {return;}

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const resolved = resolveTheme('system');
        setResolvedTheme(resolved);
        
        // Apply theme to document
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(resolved);
      }
    };

    try {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (error) {
      console.warn(`Failed to setup system theme listener: ${error}`);
    }
  }, [theme]);

  // Enable smooth transitions with respect for reduced motion
  useEffect(() => {
    try {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      if (!prefersReducedMotion.matches) {
        const style = document.createElement('style');
        style.id = 'theme-transitions';
        style.textContent = `
          *, *::before, *::after {
            transition: 
              background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              fill 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              stroke 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              filter 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              backdrop-filter 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
        `;
        
        // Only add if not already present
        if (!document.getElementById('theme-transitions')) {
          document.head.appendChild(style);
        }
      }
    } catch (error) {
      console.warn(`Failed to enable theme transitions: ${error}`);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    if (!['light', 'dark', 'system'].includes(newTheme)) {
      console.warn(`Invalid theme: ${newTheme}. Using system theme.`);
      newTheme = 'system';
    }
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const resolved = resolveTheme(theme);
    setTheme(resolved === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}