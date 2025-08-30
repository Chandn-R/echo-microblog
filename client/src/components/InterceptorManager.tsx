import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { setupInterceptors } from "@/services/api";

export const InterceptorManager = ({ children }: { children: ReactNode }) => {
    const authContext = useAuth();

    useEffect(() => {
        setupInterceptors(authContext);
    }, [authContext]);

    return <>{children}</>;
};
