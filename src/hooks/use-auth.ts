import { useState, useCallback, useEffect } from "react";
import { AxiosError } from "axios";
import api from "@/lib/api";

// =========================================================
// Constants
// =========================================================
const USER_KEY = "user";

// =========================================================
// Types
// =========================================================

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: "student" | "librarian";
  full_name: string;
  is_email_verified: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  [key: string]: unknown;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthHookReturn extends AuthState {
  register: (payload: RegisterPayload) => Promise<RegisterResult>;
  verifyEmail: (payload: VerifyEmailPayload) => Promise<VerifyEmailResult>;
  login: (payload: LoginPayload) => Promise<LoginResult>;
  logout: () => Promise<LogoutResult>;
  clearError: () => void;
}

export type RegisterResult =
  | { ok: true; message: string; username: string }
  | { ok: false; errors: Record<string, string[]> };

export type VerifyEmailResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export type LoginResult =
  | { ok: true; user: UserProfile }
  | { ok: false; error: string };

export type LogoutResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

// =========================================================
// useAuth (FINAL)
// =========================================================

export function useAuth(): AuthHookReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =========================================================
  // Load user from localStorage on app start
  // =========================================================
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
  }, []);

  // =========================================================
  // Helper: loading wrapper
  // =========================================================
  const withLoading = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      setIsLoading(true);
      setError(null);
      try {
        return await fn();
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // =========================================================
  // Register
  // =========================================================
  const register = useCallback(
    (payload: RegisterPayload) =>
      withLoading(async (): Promise<RegisterResult> => {
        try {
          const { data } = await api.post<{ message: string; username: string }>(
            "/auth/register/",
            payload
          );
          return { ok: true, message: data.message, username: data.username };
        } catch (err) {
          const axiosErr = err as AxiosError<Record<string, string[]>>;
          const errors =
            axiosErr.response?.data ?? {
              non_field_errors: ["Registration failed."],
            };
          setError("Registration failed.");
          return { ok: false, errors };
        }
      }),
    [withLoading]
  );

  // =========================================================
  // Verify Email
  // =========================================================
  const verifyEmail = useCallback(
    (payload: VerifyEmailPayload) =>
      withLoading(async (): Promise<VerifyEmailResult> => {
        try {
          const { data } = await api.post<{ message: string }>(
            "/auth/verify-email/",
            payload
          );
          return { ok: true, message: data.message };
        } catch (err) {
          const axiosErr = err as AxiosError<{ error?: string }>;
          const msg =
            axiosErr.response?.data?.error ??
            "Email verification failed.";
          setError(msg);
          return { ok: false, error: msg };
        }
      }),
    [withLoading]
  );

  // =========================================================
  // Login (SAVE to localStorage)
  // =========================================================
  const login = useCallback(
    (payload: LoginPayload) =>
      withLoading(async (): Promise<LoginResult> => {
        try {
          const { data } = await api.post<{ user: UserProfile }>(
            "/auth/login/",
            payload
          );

          // ✅ Save in state
          setUser(data.user);

          // ✅ Save in localStorage
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));

          return { ok: true, user: data.user };
        } catch (err) {
          const axiosErr = err as AxiosError<{ error?: string }>;
          const msg =
            axiosErr.response?.status === 403
              ? "Account not active. Please verify your email."
              : axiosErr.response?.data?.error ??
                "Invalid credentials.";
          setError(msg);
          return { ok: false, error: msg };
        }
      }),
    [withLoading]
  );

  // =========================================================
  // Logout (CLEAR localStorage)
  // =========================================================
  const logout = useCallback(
    () =>
      withLoading(async (): Promise<LogoutResult> => {
        try {
          const { data } = await api.post<{ message: string }>(
            "/auth/logout/"
          );

          // ✅ Clear state
          setUser(null);

          // ✅ Clear localStorage
          localStorage.removeItem(USER_KEY);

          return { ok: true, message: data.message };
        } catch (err) {
          const axiosErr = err as AxiosError<{ error?: string }>;
          const msg =
            axiosErr.response?.data?.error ??
            "Logout failed.";
          setError(msg);
          return { ok: false, error: msg };
        }
      }),
    [withLoading]
  );

  // =========================================================
  // Return
  // =========================================================
  return {
    user,
    isLoading,
    error,
    register,
    verifyEmail,
    login,
    logout,
    clearError: () => setError(null),
  };
}