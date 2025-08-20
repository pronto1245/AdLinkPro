/**
 * Unified Theme Management Utility
 * Provides consistent theme management across all parts of the application
 */

// Theme types
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Unified localStorage key
const THEME_STORAGE_KEY = 'app-theme';
const SYSTEM_THEME_STORAGE_KEY = 'app-system-theme';

/**
 * Safe localStorage operations with error handling
 */
const storage = {
  get(key, fallback = null) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch (error) {
      console.warn(`Failed to read from localStorage: ${error.message}`);
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to write to localStorage: ${error.message}`);
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove from localStorage: ${error.message}`);
    }
  },

  clear() {
    try {
      // Remove all theme-related keys
      localStorage.removeItem('theme');
      localStorage.removeItem('vite-ui-theme');
      localStorage.removeItem(THEME_STORAGE_KEY);
      localStorage.removeItem(SYSTEM_THEME_STORAGE_KEY);
    } catch (error) {
      console.warn(`Failed to clear theme storage: ${error.message}`);
    }
  }
};

/**
 * System theme detection
 */
function getSystemTheme() {
  try {
    if (typeof window === 'undefined') return THEMES.LIGHT;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    return mediaQuery.matches ? THEMES.DARK : THEMES.LIGHT;
  } catch (error) {
    console.warn(`Failed to detect system theme: ${error.message}`);
    return THEMES.LIGHT;
  }
}

/**
 * Resolve theme preference to actual theme
 */
function resolveTheme(themePreference) {
  if (themePreference === THEMES.SYSTEM) {
    return getSystemTheme();
  }
  return themePreference === THEMES.DARK ? THEMES.DARK : THEMES.LIGHT;
}

/**
 * Apply theme to DOM
 */
function applyTheme(theme, useDataAttribute = true) {
  try {
    const resolvedTheme = resolveTheme(theme);
    const root = document.documentElement;

    if (useDataAttribute) {
      // Method for netlify sites
      root.setAttribute('data-theme', resolvedTheme);
    } else {
      // Method for React app
      root.classList.remove(THEMES.LIGHT, THEMES.DARK);
      root.classList.add(resolvedTheme);
    }

    // Store system theme if using system preference
    if (theme === THEMES.SYSTEM) {
      storage.set(SYSTEM_THEME_STORAGE_KEY, resolvedTheme);
    }

    return resolvedTheme;
  } catch (error) {
    console.error(`Failed to apply theme: ${error.message}`);
    return THEMES.LIGHT;
  }
}

/**
 * Get current theme preference
 */
function getCurrentTheme() {
  // Check for saved preference
  const savedTheme = storage.get(THEME_STORAGE_KEY);
  if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
    return savedTheme;
  }

  // Check for legacy keys and migrate
  const legacyTheme = storage.get('theme');
  if (legacyTheme && [THEMES.LIGHT, THEMES.DARK].includes(legacyTheme)) {
    storage.set(THEME_STORAGE_KEY, legacyTheme);
    storage.remove('theme');
    return legacyTheme;
  }

  // Check for old vite theme key
  const viteTheme = storage.get('vite-ui-theme');
  if (viteTheme && [THEMES.LIGHT, THEMES.DARK].includes(viteTheme)) {
    storage.set(THEME_STORAGE_KEY, viteTheme);
    storage.remove('vite-ui-theme');
    return viteTheme;
  }

  // Default to system preference
  return THEMES.SYSTEM;
}

/**
 * Set theme preference
 */
function setTheme(newTheme, useDataAttribute = true) {
  if (!Object.values(THEMES).includes(newTheme)) {
    console.warn(`Invalid theme: ${newTheme}. Using light theme.`);
    newTheme = THEMES.LIGHT;
  }

  // Save preference
  storage.set(THEME_STORAGE_KEY, newTheme);

  // Apply theme
  return applyTheme(newTheme, useDataAttribute);
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme(useDataAttribute = true) {
  const currentTheme = getCurrentTheme();
  const currentResolved = resolveTheme(currentTheme);
  const newTheme = currentResolved === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
  
  return setTheme(newTheme, useDataAttribute);
}

/**
 * Initialize theme system
 */
function initTheme(useDataAttribute = true) {
  const theme = getCurrentTheme();
  const resolvedTheme = applyTheme(theme, useDataAttribute);

  // Listen for system theme changes
  if (typeof window !== 'undefined' && theme === THEMES.SYSTEM) {
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (getCurrentTheme() === THEMES.SYSTEM) {
          applyTheme(THEMES.SYSTEM, useDataAttribute);
        }
      });
    } catch (error) {
      console.warn(`Failed to setup system theme listener: ${error.message}`);
    }
  }

  return { theme, resolvedTheme };
}

/**
 * Add smooth transitions with respect for reduced motion
 */
function enableThemeTransitions() {
  try {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (!prefersReducedMotion.matches) {
      const style = document.createElement('style');
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
        
        .theme-transition-disable * {
          transition: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  } catch (error) {
    console.warn(`Failed to enable theme transitions: ${error.message}`);
  }
}

/**
 * Get theme info for display
 */
function getThemeInfo() {
  const currentTheme = getCurrentTheme();
  const resolvedTheme = resolveTheme(currentTheme);
  const systemTheme = getSystemTheme();

  return {
    preference: currentTheme,
    resolved: resolvedTheme,
    system: systemTheme,
    isSystem: currentTheme === THEMES.SYSTEM
  };
}

/**
 * Recover from corrupted theme state
 */
function recoverThemeState() {
  try {
    // Clear all potentially corrupted theme data
    storage.clear();
    
    // Reset to system default
    const systemTheme = getSystemTheme();
    storage.set(THEME_STORAGE_KEY, THEMES.SYSTEM);
    
    // Apply the resolved theme
    applyTheme(THEMES.SYSTEM, true);
    
    console.log('Theme state recovered, reset to system preference:', systemTheme);
    return { recovered: true, theme: systemTheme };
  } catch (error) {
    console.error('Failed to recover theme state:', error);
    return { recovered: false, error: error.message };
  }
}

/**
 * Validate theme integrity
 */
function validateThemeIntegrity() {
  try {
    const currentTheme = getCurrentTheme();
    const resolvedTheme = resolveTheme(currentTheme);
    const systemTheme = getSystemTheme();
    
    // Check if current theme is valid
    if (!Object.values(THEMES).includes(currentTheme)) {
      console.warn('Invalid theme detected, recovering...');
      return recoverThemeState();
    }
    
    // Check if DOM state matches expected state
    const root = document.documentElement;
    const hasDataTheme = root.hasAttribute('data-theme');
    const dataThemeValue = root.getAttribute('data-theme');
    const hasClassTheme = root.classList.contains(THEMES.LIGHT) || root.classList.contains(THEMES.DARK);
    
    if (!hasDataTheme && !hasClassTheme) {
      console.warn('No theme applied to DOM, applying current theme...');
      applyTheme(currentTheme, hasDataTheme || !hasClassTheme);
    }
    
    return {
      valid: true,
      preference: currentTheme,
      resolved: resolvedTheme,
      system: systemTheme,
      domState: {
        hasDataTheme,
        dataThemeValue,
        hasClassTheme
      }
    };
  } catch (error) {
    console.error('Theme validation failed:', error);
    return recoverThemeState();
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  // CommonJS
  module.exports = {
    THEMES,
    storage,
    getSystemTheme,
    resolveTheme,
    applyTheme,
    getCurrentTheme,
    setTheme,
    toggleTheme,
    initTheme,
    enableThemeTransitions,
    getThemeInfo,
    recoverThemeState,
    validateThemeIntegrity
  };
} else if (typeof window !== 'undefined') {
  // Browser global
  window.ThemeUtils = {
    THEMES,
    storage,
    getSystemTheme,
    resolveTheme,
    applyTheme,
    getCurrentTheme,
    setTheme,
    toggleTheme,
    initTheme,
    enableThemeTransitions,
    getThemeInfo,
    recoverThemeState,
    validateThemeIntegrity
  };
}