import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { ROLES, PERMISSIONS } from "../utils/roleConfig";
import AuthGuard from "../components/auth/AuthGuard";
import PermissionGuard from "../components/auth/PermissionGuard";
import StaffLayout from "../layouts/StaffLayout";

// Import các page components cho staff
const StaffDashboard = React.lazy(() => import("../pages/staff/StaffDashboard"));
const StaffOrders = React.lazy(() => import("../pages/staff/StaffOrders"));
const StaffMenu = React.lazy(() => import("../pages/staff/StaffMenu"));
const StaffReports = React.lazy(() => import("../pages/staff/StaffReports"));
const StaffProfile = React.lazy(() => import("../pages/staff/StaffProfile"));

// Trang lỗi chung
const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <h1 className="text-xxl font-bold text-red-600 mb-4">403</h1>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Không được phép truy cập</h2>
      <p className="text-base text-gray-600 mb-6">Bạn không có quyền truy cập vào trang này.</p>
      <a
        href="/"
        className="bg-blue-500 hover:bg-blue-600 text-base text-white px-6 py-2 rounded-lg transition-colors">
        Về trang chủ
      </a>
    </div>
  </div>
);

const StaffLayoutWrapper = () => {
  return (
    <StaffLayout>
      <Outlet />
    </StaffLayout>
  );
};

export const StaffRoutes = [
  {
    path: "/staff",
    element: (
      <AuthGuard allowedRoles={[ROLES.STAFF, ROLES.ADMIN]}>
        <StaffLayoutWrapper />
      </AuthGuard>
    ),
    errorElement: <Unauthorized />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      {
        path: "dashboard",
        element: (
          <React.Suspense fallback={<div>Đang tải...</div>}>
            <StaffDashboard />
          </React.Suspense>
        ),
      },
      {
        path: "orders",
        element: (
          <PermissionGuard requiredPermissions={[PERMISSIONS.VIEW_ORDERS]}>
            <React.Suspense fallback={<div>Đang tải...</div>}>
              <StaffOrders />
            </React.Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: "menu",
        element: (
          <PermissionGuard requiredPermissions={[PERMISSIONS.MANAGE_MENU]}>
            <React.Suspense fallback={<div>Đang tải...</div>}>
              <StaffMenu />
            </React.Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: "reports",
        element: (
          <PermissionGuard requiredPermissions={[PERMISSIONS.VIEW_DAILY_REPORTS]}>
            <React.Suspense fallback={<div>Đang tải...</div>}>
              <StaffReports />
            </React.Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: "profile",
        element: (
          <PermissionGuard requiredPermissions={[PERMISSIONS.VIEW_STAFF_PROFILE]}>
            <React.Suspense fallback={<div>Đang tải...</div>}>
              <StaffProfile />
            </React.Suspense>
          </PermissionGuard>
        ),
      },
    ],
  },
];
