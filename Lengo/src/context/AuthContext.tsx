import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, AuthContextProps, LoginCredentials, RegisterData } from '../types';
import AuthService from '../services/AuthService';

// Create the default auth state
const defaultAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Create the context with default values
const AuthContext = createContext<AuthContextProps>({
  authState: defaultAuthState,
  login: async () => { },
  register: async () => { },
  logout: () => { },
  resetPassword: async () => { },
  clearError: () => { },
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);

  // Check for existing user on load
  useEffect(() => {
    const loadUser = async () => {
      try {
        const isLoggedIn = await AuthService.isLoggedIn();

        if (isLoggedIn) {
          const user = await AuthService.getCurrentUser();
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            ...defaultAuthState,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setAuthState({
          ...defaultAuthState,
          isLoading: false,
          error: 'Failed to load authentication state',
        });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const user = await AuthService.login(credentials);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed. Please check your credentials.',
      }));
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const user = await AuthService.register(data);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Registration error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed. Please try again.',
      }));
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AuthService.logout();

      // Oturum bilgilerini temizle
      setAuthState({
        ...defaultAuthState,
        isLoading: false,
      });

      // Burada navigasyon işlemi yapmıyoruz, sadece state'i güncelliyoruz
      // App.tsx içindeki koşullu render sayesinde otomatik olarak Auth ekranına yönlendirilecek
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      await AuthService.resetPassword(email);

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Password reset error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password reset failed. Please try again.',
      }));
    }
  };

  // Clear error function
  const clearError = () => {
    setAuthState(prev => ({
      ...prev,
      error: null,
    }));
  };

  return (
    <AuthContext.Provider value={{ authState, login, register, logout, resetPassword, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
