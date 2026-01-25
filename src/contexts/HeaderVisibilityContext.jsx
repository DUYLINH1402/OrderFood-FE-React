import React, { createContext, useContext, useState, useEffect, useRef } from "react";

const HeaderVisibilityContext = createContext({
  isHeaderVisible: true,
});

/**
 * Provider quản lý trạng thái ẩn/hiện của Header và các element sticky
 * Khi scroll xuống -> ẩn, scroll lên -> hiện
 */
export const HeaderVisibilityProvider = ({ children }) => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 10; // Ngưỡng scroll tối thiểu để kích hoạt

      // Nếu đang ở đầu trang, luôn hiển thị header
      if (currentScrollY < 50) {
        setIsHeaderVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Kiểm tra hướng scroll với ngưỡng
      if (Math.abs(currentScrollY - lastScrollY.current) < scrollThreshold) {
        return;
      }

      if (currentScrollY > lastScrollY.current) {
        // Scroll xuống -> ẩn header
        setIsHeaderVisible(false);
      } else {
        // Scroll lên -> hiện header
        setIsHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <HeaderVisibilityContext.Provider value={{ isHeaderVisible }}>
      {children}
    </HeaderVisibilityContext.Provider>
  );
};

/**
 * Hook để sử dụng trạng thái ẩn/hiện header
 */
export const useHeaderVisibility = () => {
  const context = useContext(HeaderVisibilityContext);
  if (!context) {
    throw new Error("useHeaderVisibility must be used within a HeaderVisibilityProvider");
  }
  return context;
};

export default HeaderVisibilityContext;
