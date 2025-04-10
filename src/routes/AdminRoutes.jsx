import React from "react";
import ProtectedRoute from "./ProtectedRoute";
import { Navigate } from "react-router-dom";

// Pages
const AdminLayout = () => (
  <div>
    <h1>Admin Layout</h1>
    <p>Menu bên trái...</p>
  </div>
);
const AdminDashboard = () => <h2>Admin Dashboard</h2>;
const FoodManager = () => <h2>Quản lý món ăn</h2>;
const Unauthorized = () => <h2>Không có quyền truy cập</h2>;

export const AdminRoutes = [
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]} redirectPath="/unauthorized">
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <Unauthorized />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "foods", element: <FoodManager /> },
    ],
  },
];
