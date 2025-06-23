import api from "@/lib/api";

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  name: string;
  username: string;
  email: string;
  password: string;
};

type ApiResponse<T = any> = {
  data?: T;
  error?: {
    message: string;
    status?: number;
  };
};

export const loginUser = async (data: LoginData): Promise<ApiResponse> => {
  try {
    const response = await api.post("/auth/login", data);
    return { data: response.data };
  } catch (error: any) {
    return {
      error: {
        message: error.response?.data?.message || "Login failed",
        status: error.response?.status,
      },
    };
  }
};

export const registerUser = async (data: RegisterData): Promise<ApiResponse> => {
  try {
    const response = await api.post("/auth/signup", data);
    return { data: response.data };
  } catch (error: any) {
    return {
      error: {
        message: error.response?.data?.message || "Registration failed",
        status: error.response?.status,
      },
    };
  }
};

export const logoutUser = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error: any) {
    return {
      error: {
        message: error.response?.data?.message || "Logout failed",
        status: error.response?.status,
      },
    };
  }
};

