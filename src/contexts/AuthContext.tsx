import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, LoginForm, RegisterForm } from '../types';
import apiService from '../services/api';

// Auth state interface
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Auth actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Auth context interface
interface AuthContextType {
  state: AuthState;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  changePassword: (passwordData: { currentPassword: string; newPassword: string }) => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token is still valid by fetching current user
          const response = await apiService.getCurrentUser();
          if (response.success && response.data) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: response.data,
                token,
              },
            });
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch({ type: 'LOGOUT' });
          }
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginForm) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await apiService.login(credentials);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });
      } else {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: response.message || 'Login failed',
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage,
      });
    }
  };

  // Register function
  const register = async (userData: RegisterForm) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await apiService.register(userData);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });
      } else {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: response.message || 'Registration failed',
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage,
      });
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    }
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    dispatch({ type: 'LOGOUT' });
  };

  // Update profile function
  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await apiService.updateProfile(userData);
      
      if (response.success && response.data) {
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data,
        });
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Change password function
  const changePassword = async (passwordData: { currentPassword: string; newPassword: string }) => {
    try {
      const response = await apiService.changePassword(passwordData);
      
      if (!response.success) {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    state,
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
