import {
    createContext,
    useState,
    useContext,
    useEffect,
    type ReactNode,
} from "react";
import toast from "react-hot-toast";
import api from "../services/api";

interface User {
    profilePicture?: {
        secure_url: string;
    };
    _id: string;
    name: string;
    username: string;
    email: string;
    bio?: string;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    login: (data: { email: string; password: string }) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserDetails = async (token: string) => {
        try {
            const response = await api.get("/users/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data.data);
        } catch (error) {
            console.error("Failed to fetch user details", error);
            await logout();
        }
    };

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await api.post("/auth/refresh");
                console.log("RESPONSE FROM /AUTH/REFRESH ", response.data);

                const newAccessToken = response.data.data.accessToken;
                console.log("RECIEVED ACC TOKN ", newAccessToken);
                setAccessToken(newAccessToken);
                await fetchUserDetails(newAccessToken);
            } catch (error) {
                setUser(null);
                setAccessToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const login = async (data: { email: string; password: string }) => {
        try {
            const response = await api.post("/auth/login", data);
            const newAccessToken = response.data.data.accessToken;

            setAccessToken(newAccessToken);
            await fetchUserDetails(newAccessToken);

            toast.success("Login successful!");
        } catch (error: any) {
            const message = error.response?.data?.message || "Login failed";
            toast.error(message);
            throw new Error(message);
        }
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error(
                "Logout API call failed, but clearing session anyway."
            );
        } finally {
            setUser(null);
            setAccessToken(null);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider
            value={{ user, accessToken, login, logout, isLoading }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
