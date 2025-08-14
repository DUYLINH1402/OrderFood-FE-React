import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";

/**
 * Component đơn giản chỉ kiểm tra authentication
 * Không kiểm tra role hay permissions
 */
const LoginRequired = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default LoginRequired;
