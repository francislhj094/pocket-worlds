import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback } from 'react';
import { AuthUser, AuthState, SignUpData, LoginData } from '@/types/auth';

const STORAGE_KEYS = {
  AUTH_USER: 'auth_user',
  REMEMBER_ME: 'remember_me',
  PENDING_VERIFICATION: 'pending_verification',
};

const MOCK_USERS_KEY = 'mock_users_db';

interface MockUser {
  id: string;
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  createdAt: number;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    pendingVerification: null,
  });

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const [storedUser, pendingVerification] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER),
        AsyncStorage.getItem(STORAGE_KEYS.PENDING_VERIFICATION),
      ]);

      setAuthState({
        user: storedUser ? JSON.parse(storedUser) : null,
        isAuthenticated: !!storedUser,
        isLoading: false,
        pendingVerification: pendingVerification ? JSON.parse(pendingVerification) : null,
      });
    } catch (error) {
      console.error('Failed to load auth state:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        pendingVerification: null,
      });
    }
  };

  const getMockUsers = async (): Promise<MockUser[]> => {
    try {
      const stored = await AsyncStorage.getItem(MOCK_USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get mock users:', error);
      return [];
    }
  };

  const saveMockUser = useCallback(async (user: MockUser) => {
    try {
      const users = await getMockUsers();
      users.push(user);
      await AsyncStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save mock user:', error);
      throw error;
    }
  }, []);

  const updateMockUser = useCallback(async (userId: string, updates: Partial<MockUser>) => {
    try {
      const users = await getMockUsers();
      const index = users.findIndex(u => u.id === userId);
      if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        await AsyncStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
      }
    } catch (error) {
      console.error('Failed to update mock user:', error);
      throw error;
    }
  }, []);

  const checkUsernameAvailability = useCallback(async (username: string): Promise<boolean> => {
    try {
      const users = await getMockUsers();
      return !users.some(u => u.username.toLowerCase() === username.toLowerCase());
    } catch (error) {
      console.error('Failed to check username:', error);
      return false;
    }
  }, []);

  const checkEmailAvailability = useCallback(async (email: string): Promise<boolean> => {
    try {
      const users = await getMockUsers();
      return !users.some(u => u.email.toLowerCase() === email.toLowerCase());
    } catch (error) {
      console.error('Failed to check email:', error);
      return false;
    }
  }, []);

  const signUp = useCallback(async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
    try {
      const users = await getMockUsers();
      
      if (users.some(u => u.username.toLowerCase() === data.username.toLowerCase())) {
        return { success: false, error: 'Username already taken' };
      }
      
      if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        return { success: false, error: 'Email already registered' };
      }

      const userId = 'user_' + Date.now();
      const newUser: MockUser = {
        id: userId,
        username: data.username,
        email: data.email,
        password: data.password,
        isVerified: false,
        createdAt: Date.now(),
      };

      await saveMockUser(newUser);

      const pendingVerification = {
        email: data.email,
        userId: userId,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_VERIFICATION, JSON.stringify(pendingVerification));

      setAuthState(prev => ({
        ...prev,
        pendingVerification,
      }));

      return { success: true };
    } catch (error) {
      console.error('Sign up failed:', error);
      return { success: false, error: 'Sign up failed. Please try again.' };
    }
  }, [saveMockUser]);

  const verifyEmail = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!authState.pendingVerification) {
        return { success: false, error: 'No pending verification found' };
      }

      if (code.length !== 6) {
        return { success: false, error: 'Invalid verification code' };
      }

      const userId = authState.pendingVerification.userId;
      await updateMockUser(userId, { isVerified: true });

      const users = await getMockUsers();
      const user = users.find(u => u.id === userId);

      if (user) {
        const authUser: AuthUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          isGuest: false,
          isVerified: true,
          createdAt: user.createdAt,
        };

        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(authUser));
        await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_VERIFICATION);

        setAuthState({
          user: authUser,
          isAuthenticated: true,
          isLoading: false,
          pendingVerification: null,
        });

        return { success: true };
      }

      return { success: false, error: 'User not found' };
    } catch (error) {
      console.error('Verification failed:', error);
      return { success: false, error: 'Verification failed. Please try again.' };
    }
  }, [authState.pendingVerification, updateMockUser]);

  const resendVerificationCode = useCallback(async (): Promise<boolean> => {
    try {
      console.log('Verification code sent to:', authState.pendingVerification?.email);
      return true;
    } catch (error) {
      console.error('Failed to resend code:', error);
      return false;
    }
  }, [authState.pendingVerification]);

  const login = useCallback(async (data: LoginData): Promise<{ success: boolean; error?: string }> => {
    try {
      const users = await getMockUsers();
      const user = users.find(
        u => 
          (u.email.toLowerCase() === data.emailOrUsername.toLowerCase() || 
           u.username.toLowerCase() === data.emailOrUsername.toLowerCase()) &&
          u.password === data.password
      );

      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      if (!user.isVerified) {
        const pendingVerification = {
          email: user.email,
          userId: user.id,
        };
        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_VERIFICATION, JSON.stringify(pendingVerification));
        setAuthState(prev => ({
          ...prev,
          pendingVerification,
        }));
        return { success: false, error: 'Please verify your email first' };
      }

      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        isGuest: false,
        isVerified: true,
        createdAt: user.createdAt,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(authUser));
      
      if (data.rememberMe) {
        await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      }

      setAuthState({
        user: authUser,
        isAuthenticated: true,
        isLoading: false,
        pendingVerification: null,
      });

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }, []);

  const loginAsGuest = useCallback(async (): Promise<void> => {
    try {
      const guestUser: AuthUser = {
        id: 'guest_' + Date.now(),
        username: 'Guest' + Math.floor(Math.random() * 10000),
        email: '',
        isGuest: true,
        isVerified: false,
        createdAt: Date.now(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(guestUser));

      setAuthState({
        user: guestUser,
        isAuthenticated: true,
        isLoading: false,
        pendingVerification: null,
      });
    } catch (error) {
      console.error('Guest login failed:', error);
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const users = await getMockUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return { success: false, error: 'Email not found' };
      }

      console.log('Password reset email sent to:', email);
      return { success: true };
    } catch (error) {
      console.error('Password reset failed:', error);
      return { success: false, error: 'Failed to send reset email. Please try again.' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER),
        AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_ME),
      ]);

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        pendingVerification: null,
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  return {
    ...authState,
    checkUsernameAvailability,
    checkEmailAvailability,
    signUp,
    verifyEmail,
    resendVerificationCode,
    login,
    loginAsGuest,
    requestPasswordReset,
    logout,
  };
});
