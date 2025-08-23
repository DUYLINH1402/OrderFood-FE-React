import { useState, useEffect } from "react";

/**
 * Custom hook để tính toán chính xác height của header
 * Theo dõi thay đổi kích thước và tự động cập nhật
 */
export const useHeaderHeight = (headerSelector = "header") => {
  const [headerHeight, setHeaderHeight] = useState(80); // Default height

  useEffect(() => {
    const calculateHeaderHeight = () => {
      const headerElement = document.querySelector(headerSelector);
      if (headerElement) {
        const height = headerElement.offsetHeight;
        setHeaderHeight(height);
      }
    };

    // Tính toán lần đầu
    calculateHeaderHeight();

    // Theo dõi thay đổi kích thước window
    const handleResize = () => {
      calculateHeaderHeight();
    };

    // Theo dõi DOM changes (nếu header thay đổi)
    const observer = new MutationObserver(() => {
      calculateHeaderHeight();
    });

    const headerElement = document.querySelector(headerSelector);
    if (headerElement) {
      observer.observe(headerElement, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [headerSelector]);

  return headerHeight;
};

export default useHeaderHeight;
