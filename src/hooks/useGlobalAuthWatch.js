import { useEffect } from "react";
import { useSelector } from "react-redux";

/**
 * Hook toàn cục để theo dõi authentication state
 * và force redirect khi cần thiết
 */
export const useGlobalAuthWatch = () => {
  const { user, accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      const currentPath = window.location.pathname;
      const protectedPaths = ["/staff", "/admin", "/profile"];
      const isProtectedPath = protectedPaths.some((path) => currentPath.startsWith(path));

      // Kiểm tra nếu đang ở protected path nhưng không có authentication
      if (isProtectedPath && (!user || !accessToken)) {
        console.warn("Protected path accessed without authentication, forcing redirect...");

        // Clear tất cả storage
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (error) {
          console.warn("Error clearing storage:", error);
        }

        // Force redirect
        window.location.replace("/dang-nhap");
      }
    };

    // Chạy check ngay lập tức
    checkAuthAndRedirect();

    // Setup interval để check định kỳ
    const interval = setInterval(checkAuthAndRedirect, 5000);

    return () => clearInterval(interval);
  }, [user, accessToken]);

  // Theo dõi storage changes từ các tab khác
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "accessToken" || event.key === "user") {
        const currentPath = window.location.pathname;
        const protectedPaths = ["/staff", "/admin", "/profile"];
        const isProtectedPath = protectedPaths.some((path) => currentPath.startsWith(path));

        if (isProtectedPath && !event.newValue) {
          console.warn("Auth data cleared in another tab, redirecting...");
          window.location.replace("/dang-nhap");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
};

export default useGlobalAuthWatch;
