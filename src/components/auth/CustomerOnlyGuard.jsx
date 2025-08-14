import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";
import { ROLES, ROLE_ROUTES } from "../../utils/roleConfig";

/**
 * Component bảo vệ routes chỉ dành cho CUSTOMER
 * Redirect STAFF/ADMIN về dashboard của họ
 * Redirect GUEST về trang login
 */
const CustomerOnlyGuard = ({ children }) => {
  const { userRole } = useAuth();
  const location = useLocation();

  // Cho phép GUEST và CUSTOMER truy cập
  if (userRole === ROLES.GUEST || userRole === ROLES.CUSTOMER) {
    return children;
  }

  // Nếu là STAFF hoặc ADMIN, chuyển về dashboard của họ
  if (userRole === ROLES.STAFF || userRole === ROLES.ADMIN) {
    const roleConfig = ROLE_ROUTES[userRole];
    console.log(
      `${userRole} trying to access customer page, redirecting to ${roleConfig?.defaultPath}`
    );
    return <Navigate to={roleConfig?.defaultPath || "/unauthorized"} replace />;
  }

  return children;
};

export default CustomerOnlyGuard;
