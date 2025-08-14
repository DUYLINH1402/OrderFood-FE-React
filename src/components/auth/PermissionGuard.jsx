import React from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "../../hooks/auth/useAuth";
import { ROLE_ROUTES } from "../../utils/roleConfig";
import { useAuth } from "../../hooks/auth/useAuth";

/**
 * Component bảo vệ route dựa trên permissions
 * Sử dụng cho các trang cần kiểm tra quyền cụ thể
 */
const PermissionGuard = ({ children, requiredPermissions = [], requireAllPermissions = false }) => {
  const { userRole } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Kiểm tra permissions
  let hasAccess = true;

  if (requiredPermissions.length > 0) {
    if (requireAllPermissions) {
      hasAccess = hasAllPermissions(requiredPermissions);
    } else {
      hasAccess = hasAnyPermission(requiredPermissions);
    }
  }

  // Nếu không có quyền, chuyển về dashboard của role hiện tại
  if (!hasAccess) {
    const roleConfig = ROLE_ROUTES[userRole];
    return <Navigate to={roleConfig?.defaultPath || "/unauthorized"} replace />;
  }

  return children;
};

export default PermissionGuard;
