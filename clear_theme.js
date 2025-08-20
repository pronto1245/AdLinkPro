// Clear all theme-related storage and reset to system default
try {
  localStorage.removeItem('theme');
  localStorage.removeItem('vite-ui-theme');
  localStorage.removeItem('app-theme');
  localStorage.removeItem('app-system-theme');
  
  // Reset to system theme
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const systemTheme = prefersDark ? 'dark' : 'light';
  
  // Apply system theme
  document.documentElement.setAttribute('data-theme', systemTheme);
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(systemTheme);
  
  // Set system as preference
  localStorage.setItem('app-theme', 'system');
  
  console.log('Theme storage cleared and reset to system preference:', systemTheme);
} catch (error) {
  console.error('Failed to clear theme storage:', error);
}

location.reload();
