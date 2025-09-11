import {
    createContext,
    useState,
    useContext,
    useEffect,
    type ReactNode,
} from "react";
import toast from "react-hot-toast";
// Import our new service
import api, { setApiAccessToken } from "../services/api";

// User and AuthContextType interfaces remain the same
interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    bio?: string;
    profilePicture?: {
        secure_url: string;
    };
}

export interface AuthContextType {
    user: User | null;
    login: (data: { email: string; password: string }) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    // We no longer need to expose accessToken directly from context
    // The interceptor handles it automatically
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // This function can now be simplified
    const fetchUserDetails = async () => {
        try {
            // No need to pass token, the interceptor adds it!
            const response = await api.get("/users/me");
            setUser(response.data.data);
        } catch (error) {
            console.error("Failed to fetch user details", error);
            // If this fails, the interceptor might have already logged us out
            // but we ensure the user state is null
            setUser(null);
            setApiAccessToken(null); // Clear token in the api service
        }
    };

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await api.post("/auth/refresh");
                const newAccessToken = response.data.data.accessToken;
                
                // Set the token in our API service
                setApiAccessToken(newAccessToken);
                
                // Fetch user details with the new token
                await fetchUserDetails();
            } catch (error) {
                setUser(null);
                setApiAccessToken(null); // Ensure token is cleared on failure
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

            // Set the token in our API service
            setApiAccessToken(newAccessToken);
            
            // Fetch user details
            await fetchUserDetails();

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
            console.error("Logout API call failed, but clearing session anyway.");
        } finally {
            setUser(null);
            // Clear the token in our API service
            setApiAccessToken(null);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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