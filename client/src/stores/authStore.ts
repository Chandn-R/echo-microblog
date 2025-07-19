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
                sessionStorage.removeItem("tried-refresh");
                set({
                    isLoggedIn: false,
                    user: null,
                    token: null,
                    isLoading: false,
                    error: null,
                });
            },

            initializeAuth: async () => {
                set({ isLoading: true });
                const { token } = get();
                const triedRefreshing = sessionStorage.getItem("tried-refresh");

                if (!token && triedRefreshing === "true") {
                    set({
                        isLoggedIn: false,
                        user: null,
                        token: null,
                        isLoading: false,
                    });
                    return;
                }

                try {
                    if (token) {
                        const { exp } = jwtDecode<{ exp: number }>(token);
                        const isExpired = Date.now() / 1000 > exp;

                        if (!isExpired) {
                            set({ isLoggedIn: true, isLoading: false });
                            return;
                        }

                        console.log(
                            "Access token expired, attempting to refresh..."
                        );
                    }

                    sessionStorage.setItem("tried-refresh", "true");

                    const result = await authService.refreshToken();

                    if (result.success && result.token) {
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
                } catch (error) {
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
            onRehydrateStorage: () => (state) => {
                console.log("Zustand rehydrated. Now initializing auth...");
                state?.initializeAuth();
            },
        }
    )
);
