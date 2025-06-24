import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isLoggedIn, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) return <div>Loading...</div>;

  return isLoggedIn ? (children || <Outlet />) : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
