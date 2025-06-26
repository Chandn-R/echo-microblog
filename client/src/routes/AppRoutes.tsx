import Layout from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoutes";
import { CreatePost } from "@/pages/CreatePost";
import Home from "@/pages/Home";
import { Login } from "@/pages/Login";
import { SignUp } from "@/pages/SignUp";
import type { RouteObject } from "react-router-dom";
import { ProfileUpdatePageWrapper } from "@/components/ProfileUpdatePageWrapper";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "/create",
        element: (
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        ),
      },
      {
        path: "/user/:id",
        element: (
          <ProtectedRoute>
            <ProfileUpdatePageWrapper/>
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignUp /> },
];
