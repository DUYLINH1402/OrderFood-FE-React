import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";
import { ROLE_ROUTES, ROLES } from "../../utils/roleConfig";

/**
 * Component đơn giản để redirect staff/admin khỏi trang chủ
 * Chỉ sử dụng trong router context
 */
const HomeRedirect = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();

  useEffect(() => {
    if (isAuthenticated && userRole) {
      // Nếu là staff hoặc admin, chuyển về dashboard của họ
      if (userRole === ROLES.STAFF || userRole === ROLES.ADMIN) {
        const roleConfig = ROLE_ROUTES[userRole];
        if (roleConfig?.defaultPath) {
          console.log(`Redirecting ${userRole} to dashboard`);
          navigate(roleConfig.defaultPath, { replace: true });
        }
      }
    }
  }, [isAuthenticated, userRole, navigate]);

  return children;
};

export default HomeRedirect;
