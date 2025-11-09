import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { login as loginApi, register as registerApi, logout as logoutApi } from "@/lib/api/auth";
import type { LoginRequest, RegisterRequest } from "@/types/api";

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, logout: logoutStore } = useAuthStore();

  const login = useCallback(
    async (data: LoginRequest) => {
      try {
        const response = await loginApi(data);
        const userData = {
          userId: response.userId,
          email: response.email,
        };
        setUser(userData);
        // Use window.location for a full page reload to ensure state is synced
        window.location.href = "/";
      } catch (error) {
        throw error;
      }
    },
    [setUser]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        const response = await registerApi(data);
        const userData = {
          userId: response.userId,
          email: response.email,
        };
        setUser(userData);
        // Use window.location for a full page reload to ensure state is synced
        window.location.href = "/";
      } catch (error) {
        throw error;
      }
    },
    [setUser]
  );

  const logout = useCallback(() => {
    logoutApi();
    logoutStore();
    router.push("/login");
  }, [router, logoutStore]);

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
  };
}

