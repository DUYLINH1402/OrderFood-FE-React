import { useSelector } from "react-redux";
import { useMemo } from "react";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  canAccessRoute,
  getDefaultRoute,
  isAdmin,
  isStaff,
  isCustomer,
  isGuest,
  validateRole,
} from "../../utils/permissions";

/**
 * Hook chính để quản lý authentication và authorization
 */
export const useAuth = () => {
  const { user, accessToken } = useSelector((state) => state.auth);

  const isAuthenticated = useMemo(() => {
    return !!user && !!accessToken;
  }, [user, accessToken]);

  const userRole = useMemo(() => {
    return validateRole(user?.roleCode);
  }, [user?.roleCode]);

  return {
    user,
    accessToken,
    isAuthenticated,
    userRole,
    isAdmin: isAdmin(userRole),
    isStaff: isStaff(userRole),
    isCustomer: isCustomer(userRole),
    isGuest: isGuest(userRole),
  };
};

/**
 * Hook để quản lý permissions
 */
export const usePermissions = () => {
  const { userRole } = useAuth();
  return {
    hasPermission: (permission) => hasPermission(userRole, permission),
    hasAnyPermission: (permissions) => hasAnyPermission(userRole, permissions),
    hasAllPermissions: (permissions) => hasAllPermissions(userRole, permissions),
    getRolePermissions: () => getRolePermissions(userRole),
  };
};

/**
 * Hook để quản lý role
 */
export const useRole = () => {
  const {
    userRole,
    isAdmin: _isAdmin,
    isStaff: _isStaff,
    isCustomer: _isCustomer,
    isGuest: _isGuest,
  } = useAuth();

  return {
    role: userRole,
    isAdmin: _isAdmin,
    isStaff: _isStaff,
    isCustomer: _isCustomer,
    isGuest: _isGuest,
  };
};

/**
 * Hook để quản lý routing dựa trên role
 */
export const useRoutePermissions = () => {
  const { userRole } = useAuth();

  return {
    canAccessRoute: (path) => canAccessRoute(userRole, path),
    getDefaultRoute: () => getDefaultRoute(userRole),
  };
};
