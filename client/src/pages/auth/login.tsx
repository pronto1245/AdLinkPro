import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { saveToken, getToken } from "@/services/auth";
import { safeFetch, safeJsonParse, getErrorMessage, setupGlobalErrorHandling } from "@/utils/errorHandler";
import { throttledNavigate } from "@/utils/navigationThrottle";
import './auth-ui.css';

const API_BASE = import.meta.env.VITE_API_URL;
const LOGIN_PATH = import.meta.env.VITE_LOGIN_PATH || "/api/auth/login";

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
      // Extract role from token and redirect to appropriate dashboard
      try {
        const payload = JSON.parse(atob((token.split('.')[1] || '').replace(/-/g,'+').replace(/_/g,'/')));
        const role = String(payload.role || '').toUpperCase();
        
        // Redirect based on role to avoid infinite loops - use throttled navigation
        if (role === "OWNER") throttledNavigate(setLocation, "/dashboard/owner");
        else if (role === "ADVERTISER") throttledNavigate(setLocation, "/dashboard/advertiser");
        else if (role === "PARTNER") throttledNavigate(setLocation, "/dash");
        else if (role === "SUPER_ADMIN") throttledNavigate(setLocation, "/dashboard/super-admin");
        else throttledNavigate(setLocation, "/dash"); // fallback to partner dashboard
      } catch {
        // If token is invalid, remove it and stay on login page
        localStorage.removeItem('auth:token');
      }
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
      // Use safe fetch with error suppression
      const res = await safeFetch(`${API_BASE}${LOGIN_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      // Use safe JSON parsing
      const data = safeJsonParse(await res.text(), {});
      
      if (!res.ok) {
        throw new Error(getErrorMessage(res.status, data, getCustomErrorMessages()));
      }
      
      if (!data?.token) {
        throw new Error("Login successful but no authentication token received");
      }

      saveToken(data.token);

      // Get user profile with safe fetch
      try {
        const meRes = await safeFetch(`${API_BASE}/api/me`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        
        if (!meRes.ok) {
          // If profile fetch fails, extract role from token and redirect appropriately
          console.warn("Could not fetch user profile:", meRes.status);
          try {
            const payload = JSON.parse(atob((data.token.split('.')[1] || '').replace(/-/g,'+').replace(/_/g,'/')));
            const role = String(payload.role || '').toUpperCase();
            
            if (role === "OWNER") throttledNavigate(setLocation, "/dashboard/owner");
            else if (role === "ADVERTISER") throttledNavigate(setLocation, "/dashboard/advertiser");
            else if (role === "PARTNER") throttledNavigate(setLocation, "/dash");
            else if (role === "SUPER_ADMIN") throttledNavigate(setLocation, "/dashboard/super-admin");
            else throttledNavigate(setLocation, "/dash");
          } catch {
            throttledNavigate(setLocation, "/dash"); // fallback
          }
          return;
        }
        
        const me = safeJsonParse(await meRes.text(), {});
        const role = String(me.role || "").toUpperCase();
        
        // Route based on role - use proper dashboard paths and throttled navigation
        if (role === "OWNER") throttledNavigate(setLocation, "/dashboard/owner");
        else if (role === "ADVERTISER") throttledNavigate(setLocation, "/dashboard/advertiser");
        else if (role === "PARTNER") throttledNavigate(setLocation, "/dash");
        else if (role === "SUPER_ADMIN") throttledNavigate(setLocation, "/dashboard/super-admin");
        else throttledNavigate(setLocation, "/dash"); // fallback to partner dashboard
        
      } catch (profileError) {
        // Error already suppressed by our utilities, just provide fallback
        try {
          const payload = JSON.parse(atob((data.token.split('.')[1] || '').replace(/-/g,'+').replace(/_/g,'/')));
          const role = String(payload.role || '').toUpperCase();
          
          if (role === "OWNER") throttledNavigate(setLocation, "/dashboard/owner");
          else if (role === "ADVERTISER") throttledNavigate(setLocation, "/dashboard/advertiser");
          else if (role === "PARTNER") throttledNavigate(setLocation, "/dash");
          else if (role === "SUPER_ADMIN") throttledNavigate(setLocation, "/dashboard/super-admin");
          else throttledNavigate(setLocation, "/dash");
        } catch {
          throttledNavigate(setLocation, "/dash"); // fallback
        }
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