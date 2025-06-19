import Layout from "@/components/Layout";
import { CreatePost } from "@/pages/CreatePost";
import Home from "@/pages/Home";
import { Login } from "@/pages/Login";
import { SignUp } from "@/pages/SignUp";
import type { RouteObject } from "react-router-dom";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "create", element: <CreatePost /> },
      //   { path: "post/:id", element: <PostDetail /> },
      //   { path: "u/:username", element: <UserProfile /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignUp /> },
];
