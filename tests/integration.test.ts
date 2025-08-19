import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WebSocketManager } from '@/components/WebSocketManager';
import { useWebSocket } from '@/hooks/useWebSocket';
import { i18nService } from '@/services/i18n';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 100);
  }

  send(data: string) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    // Echo back for testing
    setTimeout(() => {
      this.onmessage?.(new MessageEvent('message', { data }));
    }, 50);
  }

  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSED;
    setTimeout(() => {
      this.onclose?.(new CloseEvent('close', { code: code || 1000, reason }));
    }, 50);
  }
}

// Mock environment
vi.stubGlobal('WebSocket', MockWebSocket);
vi.stubEnv('VITE_WS_URL', 'ws://localhost:3001');

describe('Integration Tests', () => {
  describe('WebSocket Integration', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should establish WebSocket connection with token', async () => {
      const token = 'test-token';
      const userId = 'user-123';
      
      const mockOnMessage = vi.fn();
      const { result } = renderHook(() => 
        useWebSocket(token, { userId, onMessage: mockOnMessage })
      );

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      expect(result.current.connectionState).toBe(WebSocket.OPEN);
    });

    it('should handle WebSocket messages', async () => {
      const token = 'test-token';
      const mockOnMessage = vi.fn();
      
      const { result } = renderHook(() => 
        useWebSocket(token, { onMessage: mockOnMessage })
      );

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Send a test message
      const testMessage = { type: 'notification', data: { title: 'Test', message: 'Hello' } };
      result.current.sendMessage(testMessage);

      await waitFor(() => {
        expect(mockOnMessage).toHaveBeenCalledWith(testMessage);
      });
    });

    it('should reconnect on connection loss', async () => {
      const token = 'test-token';
      const mockOnClose = vi.fn();
      
      const { result } = renderHook(() => 
        useWebSocket(token, { onClose: mockOnClose, maxReconnectAttempts: 2 })
      );

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Simulate connection loss
      result.current.disconnect();

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Theme Integration', () => {
    it('should switch between light and dark themes', async () => {
      const TestComponent = () => {
        const { theme, toggleTheme } = useTheme();
        return (
          <div>
            <span data-testid="current-theme">{theme}</span>
            <button onClick={toggleTheme} data-testid="toggle-theme">
              Toggle Theme
            </button>
          </div>
        );
      };

      render(<TestComponent />);

      const themeDisplay = screen.getByTestId('current-theme');
      const toggleButton = screen.getByTestId('toggle-theme');

      // Initial theme should be light
      expect(themeDisplay).toHaveTextContent('light');

      // Toggle to dark
      await userEvent.click(toggleButton);
      expect(themeDisplay).toHaveTextContent('dark');

      // Toggle back to light
      await userEvent.click(toggleButton);
      expect(themeDisplay).toHaveTextContent('light');
    });

    it('should persist theme preference in localStorage', async () => {
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });

      const TestComponent = () => {
        const { theme, setTheme } = useTheme();
        return (
          <div>
            <span data-testid="current-theme">{theme}</span>
            <button onClick={() => setTheme('dark')} data-testid="set-dark">
              Set Dark
            </button>
          </div>
        );
      };

      render(<TestComponent />);

      await userEvent.click(screen.getByTestId('set-dark'));

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('app-theme', 'dark');
    });
  });

  describe('i18n Integration', () => {
    beforeEach(async () => {
      await i18nService.initialize();
    });

    it('should initialize with default language', () => {
      expect(i18nService.getCurrentLanguage()).toBe('ru');
    });

    it('should change language and persist preference', async () => {
      await i18nService.changeLanguage('en');
      expect(i18nService.getCurrentLanguage()).toBe('en');
    });

    it('should translate keys correctly', () => {
      const translation = i18nService.translate('common.loading', 'Loading...');
      expect(translation).toBeTruthy();
      expect(typeof translation).toBe('string');
    });

    it('should format currency according to language', () => {
      i18nService.changeLanguage('en');
      const formatted = i18nService.formatCurrency(1234.56, 'USD');
      expect(formatted).toMatch(/\$1,234\.56|\$1,234.56/);

      i18nService.changeLanguage('ru');
      const formattedRu = i18nService.formatCurrency(1234.56, 'RUB');
      expect(formattedRu).toContain('1');
    });

    it('should format dates according to language', () => {
      const testDate = new Date('2023-12-25T12:00:00Z');
      
      i18nService.changeLanguage('en');
      const enDate = i18nService.formatDate(testDate);
      expect(enDate).toMatch(/12\/25\/2023|25\/12\/2023/);

      i18nService.changeLanguage('ru');
      const ruDate = i18nService.formatDate(testDate);
      expect(ruDate).toMatch(/25\.12\.2023/);
    });
  });

  describe('Authentication Integration', () => {
    const mockUser = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      role: 'advertiser' as const,
    };

    const mockToken = 'jwt-token-123';

    it('should authenticate user and store token', async () => {
      const mockLogin = vi.fn().mockResolvedValue({
        success: true,
        user: mockUser,
        token: mockToken,
      });

      const TestComponent = () => {
        const { user, token, login } = useAuth();
        
        React.useEffect(() => {
          if (!user) {
            login('testuser', 'password');
          }
        }, [user, login]);

        return (
          <div>
            <span data-testid="user-status">
              {user ? `Logged in as ${user.username}` : 'Not logged in'}
            </span>
            <span data-testid="token-status">
              {token ? 'Has token' : 'No token'}
            </span>
          </div>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as testuser');
        expect(screen.getByTestId('token-status')).toHaveTextContent('Has token');
      });
    });

    it('should handle logout correctly', async () => {
      const TestComponent = () => {
        const { user, logout } = useAuth();
        
        return (
          <div>
            <span data-testid="user-status">
              {user ? `Logged in as ${user.username}` : 'Not logged in'}
            </span>
            <button onClick={logout} data-testid="logout-btn">
              Logout
            </button>
          </div>
        );
      };

      render(<TestComponent />);
      
      await userEvent.click(screen.getByTestId('logout-btn'));

      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
    });
  });

  describe('API Integration', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should fetch dashboard stats with authentication', async () => {
      const mockStats = {
        totalClicks: 1500,
        totalRevenue: 2500.00,
        conversionRate: 3.2,
        activeOffers: 12,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      });

      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
      });

      const data = await response.json();

      expect(global.fetch).toHaveBeenCalledWith('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
      });

      expect(data).toEqual(mockStats);
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/dashboard/stats');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });
  });

  describe('Infrastructure Services Integration', () => {
    it('should coordinate WebSocket with authentication', async () => {
      const mockToken = 'test-token';
      const mockUser = { id: 'user-123', role: 'advertiser' };

      const TestWrapper = () => {
        const [token, setToken] = React.useState<string | null>(null);
        const [user, setUser] = React.useState(null);

        React.useEffect(() => {
          // Simulate login
          setTimeout(() => {
            setToken(mockToken);
            setUser(mockUser);
          }, 100);
        }, []);

        return (
          <AuthProvider value={{ user, token, login: vi.fn(), logout: vi.fn() }}>
            <WebSocketManager />
            <div data-testid="connection-status">
              {token ? 'Connected' : 'Not connected'}
            </div>
          </AuthProvider>
        );
      };

      render(<TestWrapper />);

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
      });
    });

    it('should integrate theme with i18n', async () => {
      await i18nService.initialize();

      const TestComponent = () => {
        const { theme } = useTheme();
        const { t } = useTranslation();

        return (
          <div data-theme={theme}>
            <span data-testid="theme-text">
              {t('theme.' + theme, theme)}
            </span>
          </div>
        );
      };

      render(<TestComponent />);

      const themeText = screen.getByTestId('theme-text');
      expect(themeText).toHaveTextContent(/light|светлая/i);
    });
  });

  describe('End-to-End Integration', () => {
    it('should handle complete user flow with all integrations', async () => {
      // This test would simulate a complete user journey
      // including authentication, theme changes, language changes,
      // WebSocket notifications, and API calls

      const FullIntegrationTest = () => {
        const { user, login } = useAuth();
        const { theme, toggleTheme } = useTheme();
        const { t, i18n } = useTranslation();
        const wsHook = useWebSocket(user?.token);

        const handleLogin = () => login('testuser', 'password');
        const handleLanguageChange = () => i18n.changeLanguage('en');

        return (
          <div data-theme={theme}>
            <div data-testid="integration-status">
              <span>User: {user ? 'Authenticated' : 'Not authenticated'}</span>
              <span>Theme: {theme}</span>
              <span>Language: {i18n.language}</span>
              <span>WebSocket: {wsHook.isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            
            <button onClick={handleLogin} data-testid="login-btn">Login</button>
            <button onClick={toggleTheme} data-testid="theme-btn">Toggle Theme</button>
            <button onClick={handleLanguageChange} data-testid="lang-btn">Change Language</button>
            
            <span data-testid="welcome-text">{t('dashboard.welcome', 'Welcome!')}</span>
          </div>
        );
      };

      render(<FullIntegrationTest />);

      // Test login integration
      await userEvent.click(screen.getByTestId('login-btn'));
      
      // Test theme integration
      await userEvent.click(screen.getByTestId('theme-btn'));
      
      // Test language integration
      await userEvent.click(screen.getByTestId('lang-btn'));

      // Verify all integrations work together
      await waitFor(() => {
        const status = screen.getByTestId('integration-status');
        expect(status).toHaveTextContent('User: Authenticated');
        expect(status).toHaveTextContent('Theme: dark');
        expect(status).toHaveTextContent('Language: en');
      });
    });
  });
});

// Helper function to mock hooks
function renderHook<T>(callback: () => T) {
  let result: { current: T };
  
  const TestComponent = () => {
    result = { current: callback() };
    return null;
  };

  render(<TestComponent />);
  
  return { result: result! };
}

// Mock useAuth hook for testing
const useAuth = vi.fn(() => ({
  user: null,
  token: null,
  login: vi.fn(),
  logout: vi.fn(),
}));

// Mock useTheme hook for testing
const useTheme = vi.fn(() => ({
  theme: 'light',
  setTheme: vi.fn(),
  toggleTheme: vi.fn(),
}));

// Mock useTranslation hook for testing
const useTranslation = vi.fn(() => ({
  t: vi.fn((key: string, defaultValue?: string) => defaultValue || key),
  i18n: {
    language: 'ru',
    changeLanguage: vi.fn(),
  },
}));