// app/page.tsx (or wherever you want your main layout)


import { useRoutes } from "react-router-dom";
import { routes } from "@/routes/AppRoutes";

export default function ThreadsClone() {
  const routing = useRoutes(routes);

  return routing;
  
}
