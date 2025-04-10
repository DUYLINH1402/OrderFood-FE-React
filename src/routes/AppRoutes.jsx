import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserRoutes } from "./UserRoutes";
import { AdminRoutes } from "./AdminRoutes";

// Trang lỗi chung
const Unauthorized = () => <h1>Không được phép truy cập</h1>;

const routerPage = createBrowserRouter([
  ...UserRoutes,
  ...AdminRoutes,
  { path: "/unauthorized", element: <Unauthorized /> },
]);

export const AppRoutes = () => <RouterProvider router={routerPage} />;
