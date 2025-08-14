import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserRoutes } from "./UserRoutes";
import { AdminRoutes } from "./AdminRoutes";
import { StaffRoutes } from "./StaffRoutes";

// Trang lỗi chung
const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Không được phép truy cập</h2>
      <p className="text-gray-600 mb-6">Bạn không có quyền truy cập vào trang này.</p>
      <a
        href="/"
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
        Về trang chủ
      </a>
    </div>
  </div>
);

const routerPage = createBrowserRouter([
  ...UserRoutes,
  ...StaffRoutes,
  ...AdminRoutes,
  { path: "/unauthorized", element: <Unauthorized /> },
]);

export const AppRoutes = () => <RouterProvider router={routerPage} />;
