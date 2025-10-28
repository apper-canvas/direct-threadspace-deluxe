import { createBrowserRouter } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import { getRouteConfig } from "@/router/route.utils";
import Root from "@/layouts/Root";
import Layout from "@/components/organisms/Layout";

const Home = lazy(() => import("@/components/pages/Home"));
const Popular = lazy(() => import("@/components/pages/Popular"));
const Communities = lazy(() => import("@/components/pages/Communities"));
const CommunityDetail = lazy(() => import("@/components/pages/CommunityDetail"));
const UserProfile = lazy(() => import("@/components/pages/UserProfile"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));
const PostDetail = lazy(() => import("@/components/pages/PostDetail"));
const Saved = lazy(() => import("@/components/pages/Saved"));
const SearchResults = lazy(() => import("@/components/pages/SearchResults"));
const Login = lazy(() => import("@/components/pages/Login"));
const Signup = lazy(() => import("@/components/pages/Signup"));
const Callback = lazy(() => import("@/components/pages/Callback"));
const ErrorPage = lazy(() => import("@/components/pages/ErrorPage"));
const ResetPassword = lazy(() => import("@/components/pages/ResetPassword"));
const PromptPassword = lazy(() => import("@/components/pages/PromptPassword"));

const createRoute = ({
  path,
  index,
  element,
  access,
  children,
  ...meta
}) => {
  let configPath;
  if (index) {
    configPath = "/";
  } else {
    configPath = path.startsWith('/') ? path : `/${path}`;
  }

  const config = getRouteConfig(configPath);
  const finalAccess = access || config?.allow;

  const route = {
    ...(index ? { index: true } : { path }),
    element: element ? <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  </div>}>{element}</Suspense> : element,
    handle: {
      access: finalAccess,
      ...meta,
    },
  };

  if (children && children.length > 0) {
    route.children = children;
  }

  return route;
};

const routes = [
  {
    path: "/",
    element: <Root />,
    children: [
      createRoute({
        path: "/login",
        element: <Login />,
      }),
      createRoute({
        path: "/signup",
        element: <Signup />,
      }),
      createRoute({
        path: "/callback",
        element: <Callback />,
      }),
      createRoute({
        path: "/error",
        element: <ErrorPage />,
      }),
      createRoute({
        path: "/prompt-password/:appId/:emailAddress/:provider",
        element: <PromptPassword />,
      }),
      createRoute({
        path: "/reset-password/:appId/:fields",
        element: <ResetPassword />,
      }),
      {
        path: "/",
        element: <Layout />,
        children: [
          createRoute({
            index: true,
            element: <Home />,
          }),
          createRoute({
            path: "popular",
            element: <Popular />,
          }),
          createRoute({
            path: "communities",
            element: <Communities />,
          }),
          createRoute({
            path: "search",
            element: <SearchResults />,
          }),
          createRoute({
            path: "community/:communityName",
            element: <CommunityDetail />,
          }),
          createRoute({
            path: "post/:id",
            element: <PostDetail />,
          }),
          createRoute({
            path: "user/:username",
            element: <UserProfile />,
          }),
          createRoute({
            path: "saved",
            element: <Saved />,
          }),
          createRoute({
            path: "*",
            element: <NotFound />,
          }),
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);