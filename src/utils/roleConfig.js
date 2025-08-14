// Định nghĩa các role và permissions trong hệ thống

export const ROLES = {
  GUEST: "GUEST", // Khách không đăng nhập
  CUSTOMER: "ROLE_USER", // DB sử dụng ROLE_USER cho khách hàng
  STAFF: "ROLE_STAFF",
  ADMIN: "ROLE_ADMIN",
};

export const PERMISSIONS = {
  // Customer permissions
  VIEW_MENU: "view_menu",
  ADD_TO_CART: "add_to_cart",
  PLACE_ORDER: "place_order",
  VIEW_ORDER_HISTORY: "view_order_history",
  USE_POINTS: "use_points",
  WRITE_REVIEW: "write_review",
  MANAGE_PROFILE: "manage_profile",

  // Staff permissions
  VIEW_ORDERS: "view_orders",
  UPDATE_ORDER_STATUS: "update_order_status",
  MANAGE_MENU: "manage_menu",
  VIEW_CUSTOMER_INFO: "view_customer_info",
  HANDLE_COMPLAINTS: "handle_complaints",
  VIEW_DAILY_REPORTS: "view_daily_reports",

  // Admin permissions
  MANAGE_USERS: "manage_users",
  MANAGE_STAFF: "manage_staff",
  VIEW_ANALYTICS: "view_analytics",
  MANAGE_SYSTEM_SETTINGS: "manage_system_settings",
  MANAGE_PROMOTIONS: "manage_promotions",
  VIEW_FINANCIAL_REPORTS: "view_financial_reports",
  MANAGE_ROLES: "manage_roles",
  SYSTEM_BACKUP: "system_backup",
};

// Định nghĩa permissions cho từng role
export const ROLE_PERMISSIONS = {
  [ROLES.GUEST]: [PERMISSIONS.VIEW_MENU],
  [ROLES.CUSTOMER]: [
    PERMISSIONS.VIEW_MENU,
    PERMISSIONS.ADD_TO_CART,
    PERMISSIONS.PLACE_ORDER,
    PERMISSIONS.VIEW_ORDER_HISTORY,
    PERMISSIONS.USE_POINTS,
    PERMISSIONS.WRITE_REVIEW,
    PERMISSIONS.MANAGE_PROFILE,
  ],
  [ROLES.STAFF]: [
    // Staff có thể xem menu để hỗ trợ khách hàng
    PERMISSIONS.VIEW_MENU,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.MANAGE_MENU,
    PERMISSIONS.VIEW_CUSTOMER_INFO,
    PERMISSIONS.HANDLE_COMPLAINTS,
    PERMISSIONS.VIEW_DAILY_REPORTS,
  ],
  [ROLES.ADMIN]: [
    // Admin có tất cả permissions
    ...Object.values(PERMISSIONS),
  ],
};

// Cấu hình route cho từng role
export const ROLE_ROUTES = {
  [ROLES.GUEST]: {
    defaultPath: "/",
    allowedPaths: [
      "/",
      "/gioi-thieu",
      "/dang-nhap",
      "/dang-ky",
      "/quen-mat-khau",
      "/thuc-don", // Guest có thể xem menu
    ],
  },
  [ROLES.CUSTOMER]: {
    defaultPath: "/",
    allowedPaths: [
      "/",
      "/thuc-don",
      "/dang-nhap",
      "/dang-ky",
      "/quen-mat-khau",
      "/gioi-thieu",
      "/lien-he",
      "/gio-hang",
      "/dat-hang",
      "/lich-su-don-hang",
      "/diem-thuong",
      "/ho-so",
      "/yeu-thich",
      "/danh-gia",
    ],
  },
  [ROLES.STAFF]: {
    defaultPath: "/staff/dashboard",
    allowedPaths: [
      "/staff/dashboard",
      "/staff/orders",
      "/staff/menu",
      "/staff/customers",
      "/staff/reports",
      "/staff/profile",
    ],
  },
  [ROLES.ADMIN]: {
    defaultPath: "/admin/dashboard",
    allowedPaths: [
      "/admin/dashboard",
      "/admin/users",
      "/admin/staff",
      "/admin/orders",
      "/admin/menu",
      "/admin/analytics",
      "/admin/settings",
      "/admin/promotions",
      "/admin/reports",
      "/admin/profile",
    ],
  },
};

// Sidebar/Navigation config cho từng role
export const ROLE_NAVIGATION = {
  [ROLES.CUSTOMER]: [
    { path: "/", label: "Trang chủ", icon: "home" },
    { path: "/thuc-don", label: "Thực đơn", icon: "menu" },
    { path: "/gio-hang", label: "Giỏ hàng", icon: "cart" },
    { path: "/lich-su-don-hang", label: "Đơn hàng", icon: "orders" },
    { path: "/diem-thuong", label: "Điểm thưởng", icon: "points" },
    { path: "/yeu-thich", label: "Yêu thích", icon: "heart" },
    { path: "/ho-so", label: "Hồ sơ", icon: "profile" },
  ],
  [ROLES.STAFF]: [
    { path: "/staff/dashboard", label: "Bảng điều khiển", icon: "dashboard" },
    { path: "/staff/orders", label: "Quản lý đơn hàng", icon: "orders" },
    { path: "/staff/menu", label: "Quản lý thực đơn", icon: "menu" },
    { path: "/staff/customers", label: "Khách hàng", icon: "customers" },
    { path: "/staff/reports", label: "Báo cáo", icon: "reports" },
  ],
  [ROLES.ADMIN]: [
    { path: "/admin/dashboard", label: "Bảng điều khiển", icon: "dashboard" },
    { path: "/admin/users", label: "Quản lý người dùng", icon: "users" },
    { path: "/admin/staff", label: "Quản lý nhân viên", icon: "staff" },
    { path: "/admin/orders", label: "Đơn hàng", icon: "orders" },
    { path: "/admin/menu", label: "Thực đơn", icon: "menu" },
    { path: "/admin/analytics", label: "Thống kê", icon: "analytics" },
    { path: "/admin/promotions", label: "Khuyến mãi", icon: "promotions" },
    { path: "/admin/settings", label: "Cài đặt", icon: "settings" },
  ],
};

// Theme/Layout config cho từng role
export const ROLE_THEMES = {
  [ROLES.CUSTOMER]: {
    primaryColor: "#f59e0b", // amber
    layout: "customer",
    showHeader: true,
    showFooter: true,
    showSidebar: false,
  },
  [ROLES.STAFF]: {
    primaryColor: "#3b82f6", // blue
    layout: "dashboard",
    showHeader: true,
    showFooter: false,
    showSidebar: true,
  },
  [ROLES.ADMIN]: {
    primaryColor: "#ef4444", // red
    layout: "dashboard",
    showHeader: true,
    showFooter: false,
    showSidebar: true,
  },
};
