import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ------------------------------
let isRefreshing = false;
let isLoggingOut = false;

// ------------------------------
export const logout = async () => {
  isLoggingOut = true;
  try {
    await api.post("/auth/logout/");
  } catch (err) {
    console.error("Logout failed", err);
  }
  window.location.href = "/login";
};

// ------------------------------
// Request interceptor
// ------------------------------
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const csrfToken = getCookie("csrftoken");

  if (csrfToken) {
    config.headers["X-CSRFToken"] = csrfToken;
  }

  return config;
});

// ------------------------------
// Response interceptor
// ------------------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (isLoggingOut) return Promise.reject(error);

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/token/refresh/")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) return Promise.reject(error);
      isRefreshing = true;

      try {
        await api.post("/auth/token/refresh/");
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;