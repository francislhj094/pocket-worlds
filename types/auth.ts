export interface AuthUser {
  id: string;
  username: string;
  email: string;
  isGuest: boolean;
  isVerified: boolean;
  createdAt: number;
}

export interface SignUpData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
}

export interface LoginData {
  emailOrUsername: string;
  password: string;
  rememberMe: boolean;
}

export type PasswordStrength = 'weak' | 'medium' | 'strong';

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingVerification: {
    email: string;
    userId: string;
  } | null;
}
