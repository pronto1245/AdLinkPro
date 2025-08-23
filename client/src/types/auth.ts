/**
 * Authentication and User Types
 * Enhanced typing for authentication system
 */

export interface User {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  name: string;
  company?: string;
  phone?: string;
  telegram?: string;
  isActive: boolean;
  isBlocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Allow for additional properties while maintaining type safety
  [key: string]: any;
}

export type UserRole =
  | 'owner'
  | 'super_admin'
  | 'staff'
  | 'advertiser'
  | 'partner'
  | 'affiliate';

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

export interface LoginResponse {
  success?: boolean;
  token?: string;
  user?: User;
  requires2FA?: boolean;
  message?: string;
}

export interface AuthError {
  code: string;
  message: string;
  status?: number;
  details?: any;
  timestamp: Date;
}
