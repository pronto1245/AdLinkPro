import { urlJoin } from "@/services/urlJoin";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { saveToken, getToken } from "@/services/auth";
import { login } from "@/lib/api";
import { safeFetch, safeJsonParse, getErrorMessage, setupGlobalErrorHandling } from "@/utils/errorHandler";
import { throttledNavigate } from "@/utils/navigationThrottle";
import { routeByRole, extractRoleFromToken } from "@/utils/routeByRole";
import './auth-ui.css';

const API_BASE = import.meta.env.VITE_API_URL;

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation (minimum 6 characters)
const MIN_PASSWORD_LENGTH = 6;

const LoginPage = () => {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      // Extract role from token and redirect to appropriate dashboard using centralized utility
      const role = extractRoleFromToken(token);
      const dashboardRoute = routeByRole(role);
      throttledNavigate(setLocation, dashboardRoute);
    }
    // Setup global error handling to suppress unnecessary console errors
    setupGlobalErrorHandling();
  }, [setLocation]);

  // Form validation functions
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return "Email is required";
    if (!EMAIL_REGEX.test(email)) return "Please enter a valid email address";
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return "Password is required";
    if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    return null;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError(validateEmail(newEmail));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

  const getCustomErrorMessages = (): Record<number, string> => ({
    400: "Invalid request. Please check your email and password.",
    401: "Invalid email or password. Please try again.",
    403: "Access forbidden. Your account may be suspended.",
    404: "Login service not found. Please try again later.",
    429: "Too many login attempts. Please wait and try again.",
    500: "Server error. Please try again later.",
    502: "Service temporarily unavailable. Please try again later.",
    503: "Service temporarily unavailable. Please try again later.",
    504: "Service temporarily unavailable. Please try again later."
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Clear previous errors
    setErr(null);
    setEmailError(null);
    setPasswordError(null);
    
    // Validate form
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);
    
    if (emailValidationError) {
      setEmailError(emailValidationError);
    }
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
    }
    
    if (emailValidationError || passwordValidationError) {
      return;
    }

    setLoading(true);
    
    try {
      // Use centralized login function from api service
      const result = await login(email, password);
      
      if (!result.success || !result.token) {
        throw new Error("Login failed. Please check your credentials.");
      }

      // Token is already saved by the centralized login function
      const token = result.token;

      // Get user profile with safe fetch
      try {
        const meRes = await safeFetch(urlJoin(API_BASE, "/api/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!meRes.ok) {
          // If profile fetch fails, extract role from token and redirect using centralized utility
          console.warn("Could not fetch user profile:", meRes.status);
          const role = extractRoleFromToken(token);
          const dashboardRoute = routeByRole(role);
          throttledNavigate(setLocation, dashboardRoute);
          return;
        }
        
        const me = safeJsonParse(await meRes.text(), {});
        const role = String(me.role || "");
        
        // Route based on role using centralized utility - use throttled navigation
        const dashboardRoute = routeByRole(role);
        throttledNavigate(setLocation, dashboardRoute);
        
      } catch (profileError) {
        // Error already suppressed by our utilities, just provide fallback using centralized utility
        const role = extractRoleFromToken(token);
        const dashboardRoute = routeByRole(role);
        throttledNavigate(setLocation, dashboardRoute);
      }
      
    } catch (e: any) {
      // Set user-friendly error message
      setErr(e.message || "Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-logo">🚀</div>
          <div className="brand-name">AdLinkPro</div>
        </div>
        
        <h1 className="auth-title">Вход в систему</h1>
        <p className="auth-sub">Введите ваши данные для входа</p>
        
        <form onSubmit={onSubmit}>
          <div className="auth-field">
            <label>Электронная почта</label>
            <input 
              type="email" 
              value={email} 
              onChange={handleEmailChange}
              placeholder="you@example.com"
              style={{
                borderColor: emailError ? "#ef4444" : undefined
              }}
              required
            />
            {emailError && (
              <div className="auth-error">
                {emailError}
              </div>
            )}
          </div>
          
          <div className="auth-field">
            <label>Пароль</label>
            <input 
              type="password" 
              value={password} 
              onChange={handlePasswordChange}
              placeholder="••••••••"
              style={{
                borderColor: passwordError ? "#ef4444" : undefined
              }}
              required
            />
            {passwordError && (
              <div className="auth-error">
                {passwordError}
              </div>
            )}
          </div>
          
          <div className="auth-ctas">
            <button 
              type="submit" 
              className="auth-btn"
              disabled={loading || !!emailError || !!passwordError}
              style={{
                opacity: (loading || emailError || passwordError) ? 0.6 : 1,
                cursor: (loading || emailError || passwordError) ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Вход..." : "Войти"}
            </button>
          </div>
          
          {err && (
            <div className="auth-error">
              {err}
            </div>
          )}
        </form>
        
        <div className="auth-actions">
          <a href="#" className="link">Забыли пароль?</a>
          <a href="/register" className="link">Регистрация</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;