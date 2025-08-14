import { ROLES, PERMISSIONS, ROLE_PERMISSIONS, ROLE_ROUTES } from "./roleConfig";

/**
 * Kiểm tra user có permission cụ thể hay không
 * @param {string} userRole - Role của user
 * @param {string} permission - Permission cần kiểm tra
 * @returns {boolean}
 */
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;

  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

/**
 * Kiểm tra user có một trong các permissions hay không
 * @param {string} userRole - Role của user
 * @param {string[]} permissions - Array permissions cần kiểm tra
 * @returns {boolean}
 */
export const hasAnyPermission = (userRole, permissions) => {
  if (!userRole || !permissions || !Array.isArray(permissions)) return false;

  return permissions.some((permission) => hasPermission(userRole, permission));
};

/**
 * Kiểm tra user có tất cả permissions hay không
 * @param {string} userRole - Role của user
 * @param {string[]} permissions - Array permissions cần kiểm tra
 * @returns {boolean}
 */
export const hasAllPermissions = (userRole, permissions) => {
  if (!userRole || !permissions || !Array.isArray(permissions)) return false;

  return permissions.every((permission) => hasPermission(userRole, permission));
};

/**
 * Lấy tất cả permissions của một role
 * @param {string} userRole - Role của user
 * @returns {string[]}
 */
export const getRolePermissions = (userRole) => {
  return ROLE_PERMISSIONS[userRole] || [];
};

/**
 * Kiểm tra user có thể truy cập route hay không
 * @param {string} userRole - Role của user
 * @param {string} path - Đường dẫn cần kiểm tra
 * @returns {boolean}
 */
export const canAccessRoute = (userRole, path) => {
  if (!userRole || !path) return false;

  const roleRoutes = ROLE_ROUTES[userRole];
  if (!roleRoutes) return false;

  return roleRoutes.allowedPaths.some((allowedPath) => {
    // Exact match
    if (allowedPath === path) return true;

    // Wildcard match (ví dụ: /admin/* cho tất cả routes admin)
    if (allowedPath.endsWith("/*")) {
      const basePath = allowedPath.slice(0, -2);
      return path.startsWith(basePath);
    }

    return false;
  });
};

/**
 * Lấy route mặc định cho role
 * @param {string} userRole - Role của user
 * @returns {string}
 */
export const getDefaultRoute = (userRole) => {
  const roleRoutes = ROLE_ROUTES[userRole];
  return roleRoutes ? roleRoutes.defaultPath : "/";
};

/**
 * Kiểm tra có phải admin hay không
 * @param {string} userRole - Role của user
 * @returns {boolean}
 */
export const isAdmin = (userRole) => {
  return userRole === ROLES.ADMIN;
};

/**
 * Kiểm tra có phải staff hay không
 * @param {string} userRole - Role của user
 * @returns {boolean}
 */
export const isStaff = (userRole) => {
  return userRole === ROLES.STAFF;
};

/**
 * Kiểm tra có phải customer hay không
 * @param {string} userRole - Role của user
 * @returns {boolean}
 */
export const isCustomer = (userRole) => {
  return userRole === ROLES.CUSTOMER;
};

/**
 * Kiểm tra có phải guest hay không
 * @param {string} userRole - Role của user
 * @returns {boolean}
 */
export const isGuest = (userRole) => {
  return !userRole || userRole === ROLES.GUEST;
};

/**
 * Kiểm tra có phải staff hoặc admin hay không (có quyền quản lý)
 * @param {string} userRole - Role của user
 * @returns {boolean}
 */
export const isManagementRole = (userRole) => {
  return isStaff(userRole) || isAdmin(userRole);
};

/**
 * Lấy role hierarchy level (số càng cao quyền càng lớn)
 * @param {string} userRole - Role của user
 * @returns {number}
 */
export const getRoleLevel = (userRole) => {
  const levels = {
    [ROLES.GUEST]: 0,
    [ROLES.CUSTOMER]: 1,
    [ROLES.STAFF]: 2,
    [ROLES.ADMIN]: 3,
  };

  return levels[userRole] || 0;
};

/**
 * Kiểm tra userRole có level cao hơn targetRole hay không
 * @param {string} userRole - Role của user hiện tại
 * @param {string} targetRole - Role cần so sánh
 * @returns {boolean}
 */
export const hasHigherRole = (userRole, targetRole) => {
  return getRoleLevel(userRole) > getRoleLevel(targetRole);
};

/**
 * Validate và trả về role hợp lệ
 * @param {string} role - Role cần validate
 * @returns {string} - Role hợp lệ hoặc GUEST nếu không hợp lệ/chưa đăng nhập
 */
export const validateRole = (role) => {
  const validRoles = Object.values(ROLES);
  const isValid = validRoles.includes(role);
  const result = isValid ? role : ROLES.GUEST; // Trả về GUEST thay vì null
  return result;
};
