import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { saveToken, getToken } from "@/services/auth";
import { safeFetch, safeJsonParse, getErrorMessage, setupGlobalErrorHandling } from "@/utils/errorHandler";

const API_BASE = import.meta.env.VITE_API_URL;
const LOGIN_PATH = import.meta.env.VITE_LOGIN_PATH || "/api/auth/login";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation (minimum 6 characters)
const MIN_PASSWORD_LENGTH = 6;

// Function to get role-based redirect URL
function getRoleBasedRedirect(): string {
  try {
    const token = getToken();
    if (!token) return "/login";
    
    const payload = JSON.parse(atob((token.split('.')[1] || '').replace(/-/g,'+').replace(/_/g,'/')));
    const role = String(payload.role || '').toLowerCase().trim();
    
    switch (role) {
      case 'owner': return '/dashboard/owner';
      case 'advertiser': return '/dashboard/advertiser';
      case 'partner': return '/dashboard/partner';
      case 'super_admin': return '/dashboard/super-admin';
      default: return '/dashboard/partner'; // Default fallback
    }
  } catch {
    return '/dashboard/partner'; // Safe fallback
  }
}

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
      // Redirect to appropriate dashboard based on user role
      // This avoids the circular redirect with "/"
      const redirectUrl = getRoleBasedRedirect();
      setLocation(redirectUrl);
    }
    // Setup global error handling to suppress unnecessary console errors
    setupGlobalErrorHandling();
  }, []); // Remove setLocation from dependencies as it's stable

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
          // If profile fetch fails, still proceed with login but show warning
          console.warn("Could not fetch user profile:", meRes.status);
          setLocation("/");
          return;
        }
        
        const me = safeJsonParse(await meRes.text(), {});
        const role = String(me.role || "").toUpperCase();
        
        // Route based on role
        if (role === "OWNER") setLocation("/owner");
        else if (role === "ADVERTISER") setLocation("/advertiser");
        else if (role === "PARTNER") setLocation("/partner");
        else setLocation("/");
        
      } catch (profileError) {
        // Error already suppressed by our utilities, just provide fallback
        setLocation("/");
      }
      
    } catch (e: any) {
      // Set user-friendly error message
      setErr(e.message || "Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "64px auto", fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 16 }}>Login</h1>
      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input 
          type="email" 
          value={email} 
          onChange={handleEmailChange}
          placeholder="you@example.com"
          style={{ 
            display: "block", 
            width: "100%", 
            marginBottom: emailError ? 4 : 12, 
            padding: 8,
            borderColor: emailError ? "red" : undefined
          }} 
          required
        />
        {emailError && (
          <div style={{ color: "red", fontSize: "14px", marginBottom: 12 }}>
            {emailError}
          </div>
        )}
        
        <label>Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={handlePasswordChange}
          placeholder="••••••••"
          style={{ 
            display: "block", 
            width: "100%", 
            marginBottom: passwordError ? 4 : 16, 
            padding: 8,
            borderColor: passwordError ? "red" : undefined
          }} 
          required
        />
        {passwordError && (
          <div style={{ color: "red", fontSize: "14px", marginBottom: 16 }}>
            {passwordError}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={loading || !!emailError || !!passwordError} 
          style={{ 
            padding: "10px 14px",
            opacity: (loading || emailError || passwordError) ? 0.6 : 1,
            cursor: (loading || emailError || passwordError) ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        
        {err && (
          <div style={{ color: "crimson", marginTop: 12, fontSize: "14px" }}>
            {err}
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginPage;