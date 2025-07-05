import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { authService } from "@/lib/services/authServices";

interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      token: null,
      isLoading: true,
      error: null,

      login: async (data) => {
        set({ isLoading: true, error: null });
        const result = await authService.login(data);

        if (result.success) {
          set({
            isLoggedIn: true,
            user: result.user,
            token: result.token,
            isLoading: false,
          });
        } else {
          set({
            isLoggedIn: false,
            user: null,
            token: null,
            isLoading: false,
            error: result.error || "Login failed",
          });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        await authService.logout();
        set({
          isLoggedIn: false,
          user: null,
          token: null,
          isLoading: false,
          error: null,
        });
      },

      initializeAuth: async () => {
        const { token } = get();

        if (token) {
          try {
            const { exp } = jwtDecode<{ exp: number }>(token);
            const now = Date.now() / 1000;

            if (exp > now) {
              // Token still valid
              set({ isLoggedIn: true, isLoading: false });
              return;
            }
          } catch {
            // Invalid token, continue to refresh
          }
        }

        set({ isLoading: true });

        try {
          const result = await authService.refreshToken();

          if (result.success) {
            set({
              token: result.token,
              isLoggedIn: true,
              isLoading: false,
            });
          } else {
            set({
              isLoggedIn: false,
              user: null,
              token: null,
              isLoading: false,
            });
          }
        } catch (err) {
          set({
            isLoggedIn: false,
            user: null,
            token: null,
            isLoading: false,
          });
        }
      },

      setToken: (token) => {
        set({
          token,
          isLoggedIn: !!token,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
