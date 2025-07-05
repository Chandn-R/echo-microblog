import { useRoutes } from "react-router-dom";
import { routes } from "@/routes/AppRoutes";
import axios from "axios";
import { Toaster } from "react-hot-toast";

export default function ThreadsClone() {
  const routing = useRoutes(routes);
  axios.defaults.withCredentials = true;

  return (
    <>
      {routing}
      <Toaster position="top-center" reverseOrder={true} />
    </>
  );
}
