// Navigation throttling utility to prevent excessive calls to history.pushState
// This prevents Chrome's navigation throttling error

interface NavigationEntry {
  url: string;
  timestamp: number;
}

class NavigationThrottle {
  private recentNavigations: NavigationEntry[] = [];
  private readonly maxNavigationsPerSecond = 3;
  private readonly windowMs = 1000;

  /**
   * Check if navigation should be throttled
   * @param url The URL to navigate to
   * @returns true if navigation is allowed, false if throttled
   */
  shouldAllowNavigation(url: string): boolean {
    const now = Date.now();
    
    // Remove old entries outside the time window
    this.recentNavigations = this.recentNavigations.filter(
      entry => now - entry.timestamp < this.windowMs
    );
    
    // Check if we're trying to navigate to the same URL repeatedly
    const sameUrlCount = this.recentNavigations.filter(entry => entry.url === url).length;
    if (sameUrlCount >= 2) {
      console.warn(`Navigation to ${url} throttled - already attempted ${sameUrlCount} times`);
      return false;
    }
    
    // Check if we've exceeded the rate limit
    if (this.recentNavigations.length >= this.maxNavigationsPerSecond) {
      console.warn(`Navigation throttled - too many rapid navigations (${this.recentNavigations.length}/${this.maxNavigationsPerSecond})`);
      return false;
    }
    
    // Record this navigation attempt
    this.recentNavigations.push({ url, timestamp: now });
    
    return true;
  }

  /**
   * Clear navigation history (useful for testing or manual resets)
   */
  clear(): void {
    this.recentNavigations = [];
  }

  /**
   * Get current navigation statistics
   */
  getStats(): { recentNavigations: number; lastNavigation?: string } {
    const now = Date.now();
    const recent = this.recentNavigations.filter(
      entry => now - entry.timestamp < this.windowMs
    );
    
    return {
      recentNavigations: recent.length,
      lastNavigation: recent[recent.length - 1]?.url
    };
  }
}

// Global instance
const navigationThrottle = new NavigationThrottle();

/**
 * Throttled navigation wrapper for wouter
 * @param setLocation The setLocation function from useLocation hook
 * @param url The URL to navigate to
 * @returns true if navigation was executed, false if throttled
 */
export function throttledNavigate(
  setLocation: (url: string) => void, 
  url: string
): boolean {
  if (navigationThrottle.shouldAllowNavigation(url)) {
    setLocation(url);
    return true;
  }
  return false;
}

/**
 * Get navigation throttle statistics
 */
export function getNavigationStats() {
  return navigationThrottle.getStats();
}

/**
 * Clear navigation throttle history
 */
export function clearNavigationThrottle() {
  navigationThrottle.clear();
}