import api from "@/lib/api";
import toast from "react-hot-toast";

export const authService = {
  async login(data: { email: string; password: string }) {
    try {
      const response = await api.post("/auth/login", data, {
        withCredentials: true,
      });
      const result = response.data;

      if (result?.data?.accessToken) {
        return {
          success: true,
          token: result.data.accessToken,
          user: {
            _id: result.data._id,
            username: result.data.username,
            email: result.data.email,
            name: result.data.name,
          },
        };
      }

      toast.error("Login failed - no access token received");
      return { success: false };
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Login failed";
      toast.error(message);
      return { success: false, error: message };
    }
  },

  async registerUser(data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) {
    try {
      const response = await api.post("/auth/signup", data, {
        withCredentials: true,
      });

      if (response.data?.success) {
        return {
          success: true,
          user: response.data.data,
        };
      }

      toast.error("Registration failed");
      return { success: false, error: response.data?.message };
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Registration failed";
      toast.error(message);
      return { success: false, error: message };
    }
  },

  async refreshToken() {
    try {
      const response = await api.post(
        "/auth/refresh",
        {},
        { withCredentials: true }
      );
      const result = response.data;

      if (result?.data?.accessToken) {
        return { success: true, token: result.data.accessToken };
      }

      return { success: false };
    } catch {
      return { success: false };
    }
  },

  async logout() {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      return { success: true };
    } catch {
      return { success: false };
    }
  },
};
