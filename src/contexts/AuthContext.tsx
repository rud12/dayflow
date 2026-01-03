import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { User, UserRole } from '@/types';
import { apiService } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loading: boolean;
}

interface SignupData {
  employeeId: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  secretQuestion?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 🔹 Restore session on page reload
   */
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiService.getProfile();
        if (response.success) {
          setUser(response.data);
        } else {
          localStorage.clear();
        }
      } catch {
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * 🔹 LOGIN (FIXED)
   */
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const response = await apiService.login(email, password);

        if (!response.success) return false;

        const { user: userData, accessToken, refreshToken } = response.data;

        // ✅ STORE TOKENS
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // ✅ NORMALIZE USER
        const normalizedUser: User = {
          id: String(userData.id),
          employeeId: userData.employeeId,
          email: userData.email,
          role: userData.role,
          firstName: userData.firstName,
          lastName: userData.lastName,
          department: userData.department,
          position: userData.position,
          dateOfJoining: '',
          salary: 0,
        };

        // ✅ UPDATE STATE
        setUser(normalizedUser);
        localStorage.setItem(
          'dayflow_user',
          JSON.stringify(normalizedUser)
        );

        return true;
      } catch (err) {
        console.error('Login failed:', err);
        return false;
      }
    },
    []
  );

  /**
   * 🔹 SIGNUP
   */
  const signup = useCallback(
    async (data: SignupData): Promise<boolean> => {
      try {
        const response = await apiService.signup(data);

        if (!response.success) return false;

        const { user: userData, accessToken, refreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        const normalizedUser: User = {
          id: String(userData.id),
          employeeId: userData.employeeId,
          email: userData.email,
          role: userData.role,
          firstName: userData.firstName,
          lastName: userData.lastName,
          department: userData.department,
          position: userData.position,
          dateOfJoining: '',
          salary: 0,
        };

        setUser(normalizedUser);
        localStorage.setItem(
          'dayflow_user',
          JSON.stringify(normalizedUser)
        );

        return true;
      } catch (err) {
        console.error('Signup failed:', err);
        return false;
      }
    },
    []
  );

  /**
   * 🔹 LOGOUT
   */
  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
      localStorage.clear();
      window.location.href = '/';
    }
  }, []);

  /**
   * 🔹 UPDATE PROFILE
   */
  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      if (!user) return;

      const response = await apiService.updateProfile(data);

      if (response.success) {
        const updatedUser = { ...user, ...response.data };
        setUser(updatedUser);
        localStorage.setItem(
          'dayflow_user',
          JSON.stringify(updatedUser)
        );
      }
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        signup,
        logout,
        updateProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
