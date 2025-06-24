import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/lib/services/authServices";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshResult = await authService.refreshToken();

      if (refreshResult.success) {
        useAuthStore.getState().setToken(refreshResult.token);
        originalRequest.headers["Authorization"] = `Bearer ${refreshResult.token}`;
        return api(originalRequest);
      } else {
        await useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
