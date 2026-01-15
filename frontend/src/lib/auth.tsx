import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { authApi, clearToken } from "@/lib/apiClient";
import { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const refreshMe = useCallback(async () => {
    setIsLoading(true);
    try {
      const me = await authApi.me();
      setUser(me);
    } catch (error) {
      clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const login = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true);
      try {
        await authApi.login({ username, password });
        await refreshMe();
        navigate("/playlists", { replace: true });
      } catch (error: any) {
        toast.error(error?.message || "Login failed");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, refreshMe]
  );

  const register = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true);
      try {
        await authApi.register({ username, password });
        await refreshMe();
        navigate("/playlists", { replace: true });
      } catch (error: any) {
        toast.error(error?.message || "Registration failed");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, refreshMe]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      // ignore logout errors
    } finally {
      clearToken();
      setUser(null);
      setIsLoading(false);
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshMe,
    }),
    [user, isLoading, login, register, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
