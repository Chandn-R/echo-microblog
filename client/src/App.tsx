import { useRoutes } from "react-router-dom";
import { routes } from "@/routes/AppRoutes";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore";

export default function ThreadsClone() {
  const routing = useRoutes(routes);
  axios.defaults.withCredentials = true;

  useEffect(() => {
  useAuthStore.getState().initializeAuth();
}, []);

  return (
    <>
      {routing}
      <Toaster position="top-center" reverseOrder={true} />
    </>
  );
}
