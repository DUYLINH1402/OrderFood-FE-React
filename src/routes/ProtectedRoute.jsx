import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles, redirectPath = "/dang-nhap" }) => {
  // Kiểm tra từ Redux state thay vì localStorage
  const { user, accessToken } = useSelector((state) => state.auth);

  // Nếu không có token hoặc user, redirect về login
  if (!accessToken || !user || !user.role) {
    return <Navigate to={redirectPath} replace />;
  }

  // Kiểm tra role nếu có yêu cầu cụ thể
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
