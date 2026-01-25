import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Component tự động scroll lên đầu trang khi chuyển route
 * Đặt component này trong Layout để hoạt động với mọi trang con
 */
const ScrollToTopOnNavigate = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll lên đầu trang với hiệu ứng mượt
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
};

export default ScrollToTopOnNavigate;
