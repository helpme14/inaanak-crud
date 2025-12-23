import { useState, useEffect } from "react";
import authService from "../services/auth.service";
import type { User, LoginCredentials, RegisterData } from "../types/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (
    credentials: LoginCredentials,
    userType: "admin" | "guardian"
  ) => {
    if (userType === "admin") {
      const response = await authService.loginAdmin(credentials);
      setUser(response.user);
    } else {
      const response = await authService.loginGuardian(credentials);
      setUser(response.user);
    }
  };

  const register = async (data: RegisterData) => {
    const response = await authService.registerGuardian(data);
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    isAuthenticated: authService.isAuthenticated(),
    isAdmin: authService.isAdmin(),
    isGuardian: authService.isGuardian(),
    login,
    register,
    logout,
  };
}
