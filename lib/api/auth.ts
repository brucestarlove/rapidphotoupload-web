import apiClient from "./client";
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@/types/api";

/**
 * Login user with email and password
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/api/auth/login", data);
  
  // Store token in localStorage
  if (typeof window !== "undefined" && response.data.token) {
    localStorage.setItem("auth_token", response.data.token);
  }
  
  return response.data;
}

/**
 * Register new user
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>("/api/auth/register", data);
  
  // Store token in localStorage
  if (typeof window !== "undefined" && response.data.token) {
    localStorage.setItem("auth_token", response.data.token);
  }
  
  return response.data;
}

/**
 * Logout user (clear token)
 */
export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
}

/**
 * Get current token
 */
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

