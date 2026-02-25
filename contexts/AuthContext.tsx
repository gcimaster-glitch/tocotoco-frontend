import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CONFIG } from '../config';

// ============================================================
// 型定義
// ============================================================

export interface AuthUser {
  id: string;
  email: string;
  role: 'seeker' | 'employer' | 'agent' | 'admin';
  display_name: string;
  company_name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

export interface RegisterData {
  email: string;
  password: string;
  role: 'seeker' | 'employer' | 'agent';
  display_name: string;
  company_name?: string;
}

// ============================================================
// Context
// ============================================================

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'tocotoco_auth_token';
const USER_KEY = 'tocotoco_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化：LocalStorageからトークンを復元
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AuthUser;
        setToken(storedToken);
        setUser(parsedUser);
        // バックグラウンドでトークンの有効性を確認
        verifyToken(storedToken).then(valid => {
          if (!valid) {
            clearAuth();
          }
        });
      } catch {
        clearAuth();
      }
    }
    setIsLoading(false);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const saveAuth = useCallback((newToken: string, newUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const verifyToken = async (t: string): Promise<boolean> => {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as { token?: string; user?: AuthUser; error?: string };
      if (!res.ok) {
        return { success: false, error: data.error || 'ログインに失敗しました' };
      }
      if (data.token && data.user) {
        saveAuth(data.token, data.user);
        return { success: true };
      }
      return { success: false, error: '予期しないエラーが発生しました' };
    } catch {
      return { success: false, error: 'ネットワークエラーが発生しました' };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json() as { token?: string; user?: AuthUser; error?: string };
      if (!res.ok) {
        return { success: false, error: resData.error || '登録に失敗しました' };
      }
      if (resData.token && resData.user) {
        saveAuth(resData.token, resData.user);
        return { success: true };
      }
      return { success: false, error: '予期しないエラーが発生しました' };
    } catch {
      return { success: false, error: 'ネットワークエラーが発生しました' };
    }
  };

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated: !!user && !!token,
      login,
      register,
      logout,
      getAuthHeaders,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
