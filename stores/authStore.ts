import { create } from "zustand";
import type { User } from "@/types/domain";
import { getToken, isAuthenticated } from "@/lib/api/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  checkAuth: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    // Also store user info in localStorage for persistence
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("auth_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("auth_user");
      }
    }
  },
  checkAuth: () => {
    const authenticated = isAuthenticated();
    if (authenticated) {
      // Try to restore user from localStorage
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("auth_user");
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            set({ user, isAuthenticated: true });
            return;
          } catch (e) {
            // Invalid stored user, clear it
            localStorage.removeItem("auth_user");
          }
        }
      }
      // Token exists but no user stored - set authenticated but no user
      set({ isAuthenticated: true, user: null });
    } else {
      set({ isAuthenticated: false, user: null });
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_user");
      }
    }
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
    set({ user: null, isAuthenticated: false });
  },
}));

