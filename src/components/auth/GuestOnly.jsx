import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";
import { ROLE_ROUTES } from "../../utils/roleConfig";

/**
 * Component bảo vệ các trang chỉ dành cho người chưa đăng nhập
 * Ví dụ: trang đăng nhập, đăng ký, quên mật khẩu
 * Nếu đã đăng nhập thì redirect về trang chủ hoặc dashboard
 */
const GuestOnly = ({ children, showMessage = false }) => {
  const { isAuthenticated, userRole, user } = useAuth();

  // Nếu đã đăng nhập, chuyển hướng về trang phù hợp với role
  if (isAuthenticated && userRole) {
    const roleConfig = ROLE_ROUTES[userRole];

    // Nếu là customer, về trang chủ
    // Nếu là staff/admin, về dashboard
    const redirectPath = roleConfig?.defaultPath || "/";

    // Nếu muốn hiển thị thông báo thay vì redirect ngay
    if (showMessage) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Bạn đã đăng nhập</h1>

            <p className="text-gray-600 mb-4">
              Xin chào <strong>{user?.name || user?.username}</strong>! Bạn đã đăng nhập vào hệ
              thống.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={redirectPath}
                className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                {userRole?.includes("STAFF") || userRole?.includes("ADMIN")
                  ? "Về Dashboard"
                  : "Về Trang chủ"}
              </a>
            </div>
          </div>
        </div>
      );
    }

    return <Navigate to={redirectPath} replace />;
  }

  // Nếu chưa đăng nhập, hiển thị nội dung bình thường
  return children;
};

export default GuestOnly;
