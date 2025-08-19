import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { saveToken, getToken } from "@/services/auth";
import { login } from "@/lib/api";
import { safeFetch, safeJsonParse, getErrorMessage, setupGlobalErrorHandling } from "@/utils/errorHandler";

const API_BASE = import.meta.env.VITE_API_URL;

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation (minimum 6 characters)
const MIN_PASSWORD_LENGTH = 6;

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (getToken()) setLocation("/");
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
        const meRes = await safeFetch(`${API_BASE}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
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
      <h1 style={{ marginBottom: 16 }}>Sign in</h1>
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
          {loading ? "Signing in..." : "Sign in"}
        </button>
        
        {err && (
          <div style={{ color: "crimson", marginTop: 12, fontSize: "14px" }}>
            {err}
          </div>
        )}
      </form>
    </div>
  );
}