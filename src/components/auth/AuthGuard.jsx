import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";
import { ROLE_ROUTES, ROLES } from "../../utils/roleConfig";

/**
 * Component bảo vệ routes dựa trên authentication và role
 */
const AuthGuard = ({ children, requiredRole = null, allowedRoles = [] }) => {
  const { isAuthenticated, userRole } = useAuth();
  const location = useLocation();

  // Nếu chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" state={{ from: location.pathname }} replace />;
  }

  // Nếu có yêu cầu role cụ thể
  if (requiredRole && userRole !== requiredRole) {
    const roleConfig = ROLE_ROUTES[userRole];
    return <Navigate to={roleConfig?.defaultPath || "/unauthorized"} replace />;
  }

  // Nếu có danh sách roles được phép
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    const roleConfig = ROLE_ROUTES[userRole];
    return <Navigate to={roleConfig?.defaultPath || "/unauthorized"} replace />;
  }

  // Kiểm tra path có được phép không
  const currentPath = location.pathname;
  const roleConfig = ROLE_ROUTES[userRole];

  if (roleConfig) {
    const isAllowedPath = roleConfig.allowedPaths.some(
      (allowedPath) => currentPath === allowedPath || currentPath.startsWith(allowedPath)
    );

    if (!isAllowedPath) {
      return <Navigate to={roleConfig.defaultPath} replace />;
    }
  }

  return children;
};

export default AuthGuard;
