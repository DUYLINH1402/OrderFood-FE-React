import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { ROLES, PERMISSIONS } from "../utils/roleConfig";
import AuthGuard from "../components/auth/AuthGuard";
import PermissionGuard from "../components/auth/PermissionGuard";
import AdminLayout from "../layouts/AdminLayout";

// Import các page components cho admin
const AdminDashboard = React.lazy(() => import("../pages/admin/AdminDashboard"));
const AdminUsers = React.lazy(() => import("../pages/admin/AdminUsers"));
const AdminStaff = React.lazy(() => import("../pages/admin/AdminStaff"));
const AdminOrders = React.lazy(() => import("../pages/admin/AdminOrders"));
const AdminMenu = React.lazy(() => import("../pages/admin/AdminMenu"));
const AdminAnalytics = React.lazy(() => import("../pages/admin/AdminAnalytics"));
const AdminSettings = React.lazy(() => import("../pages/admin/AdminSettings"));
const AdminPromotions = React.lazy(() => import("../pages/admin/AdminPromotions"));

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

const AdminLayoutWrapper = () => {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export const AdminRoutes = [
  {
    path: "/admin",
    element: (
      <AuthGuard allowedRoles={[ROLES.ADMIN]}>
        <AdminLayoutWrapper />
      </AuthGuard>
    ),
    errorElement: <Unauthorized />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      {
        path: "dashboard",
        element: (
          <React.Suspense fallback={<div>Đang tải...</div>}>
            <AdminDashboard />
          </React.Suspense>
        ),
      },
      {
        path: "users",
        element: (
          <PermissionGuard requiredPermissions={[PERMISSIONS.MANAGE_USERS]}>
            <React.Suspense fallback={<div>Đang tải...</div>}>
              <AdminUsers />
            </React.Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: "staff",
        element: (
          <PermissionGuard requiredPermissions={[PERMISSIONS.MANAGE_STAFF]}>
            <React.Suspense fallback={<div>Đang tải...</div>}>
              <AdminStaff />
            </React.Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: "orders",
        element: (
          <PermissionGuard requiredPermissions={[PERMISSIONS.VIEW_ORDERS]}>
            <React.Suspense fallback={<div>Đang tải...</div>}>
              <AdminOrders />
            </React.Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: "menu",
        element: (
          <PermissionGuard requiredPermissions={[PERMISSIONS.MANAGE_MENU]}>
            <React.Suspense fallback={<div>Đang tải...</div>}>
              <AdminMenu />
            </React.Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: "analytics",
        element: (
          <PermissionGuard requiredPermissions={[PERMISSIONS.VIEW_ANALYTICS]}>
            <React.Suspense fallback={<div>Đang tải...</div>}>
              <AdminAnalytics />
            </React.Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: "promotions",
        element: (
          <PermissionGuard requiredPermissions={[PERMISSIONS.MANAGE_PROMOTIONS]}>
            <React.Suspense fallback={<div>Đang tải...</div>}>
              <AdminPromotions />
            </React.Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: "settings",
        element: (
          <PermissionGuard requiredPermissions={[PERMISSIONS.MANAGE_SYSTEM_SETTINGS]}>
            <React.Suspense fallback={<div>Đang tải...</div>}>
              <AdminSettings />
            </React.Suspense>
          </PermissionGuard>
        ),
      },
    ],
  },
];
