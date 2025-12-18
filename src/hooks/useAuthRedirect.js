import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth/useAuth";

/**
 * Hook để tự động redirect khi user không còn authenticated
 * Sử dụng cho các trang cần bảo vệ như Staff Dashboard
 */
export const useAuthRedirect = (redirectPath = "/dang-nhap") => {
  const { isAuthenticated, user, accessToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirected = useRef(false);

  useEffect(() => {
    // Kiểm tra chi tiết hơn về trạng thái authentication
    const hasValidAuth = isAuthenticated && user && accessToken;

    if (!hasValidAuth && !redirected.current) {
      redirected.current = true;

      console.warn("Authentication check failed, redirecting to login");

      // Lưu current path để redirect lại sau khi login
      const currentPath = location.pathname + location.search;

      // Thử dùng React Router trước
      try {
        navigate(redirectPath, {
          replace: true,
          state: { from: currentPath },
        });
      } catch (navigateError) {
        console.warn("React Router navigate failed, using window.location:", navigateError);
        // Fallback sử dụng window.location
        setTimeout(() => {
          window.location.replace(redirectPath);
        }, 100);
      }

      // Backup redirect sau 2 giây
      setTimeout(() => {
        if (window.location.pathname !== redirectPath) {
          console.warn("Backup redirect from useAuthRedirect...");
          window.location.replace(redirectPath);
        }
      }, 2000);
    }

    // Reset redirected flag khi user được authenticated trở lại
    if (hasValidAuth) {
      redirected.current = false;
    }
  }, [
    isAuthenticated,
    user,
    accessToken,
    navigate,
    redirectPath,
    location.pathname,
    location.search,
  ]);

  return isAuthenticated && !!user && !!accessToken;
};

export default useAuthRedirect;
