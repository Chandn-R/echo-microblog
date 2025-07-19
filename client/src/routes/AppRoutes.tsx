import Layout from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoutes";
import { CreatePost } from "@/pages/CreatePost";
import Home from "@/pages/Home";
import { Login } from "@/pages/Login";
import { SignUp } from "@/pages/SignUp";
import type { RouteObject } from "react-router-dom";
import { ProfileUpdateWrapper } from "@/components/ProfileUpdateWrapper";
import { UserProfileWrapper } from "@/components/UserProfileWrapper";
import CleanLayout from "@/components/CleanLayout";
import SearchUser from "@/pages/SearchUser";

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
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignUp /> },

  {
    path: "/user/:id",
    element: <CleanLayout />,
    children: [{ index: true, element: <ProfileUpdateWrapper /> }],
  },
  {
    path: "/users/:id",
    element: <CleanLayout />,
    children: [{ index: true, element: <UserProfileWrapper /> }],
  },
  {
    path: "/search",
    element: <CleanLayout />,
    children: [{ index: true, element: <SearchUser /> }],
  },
];
