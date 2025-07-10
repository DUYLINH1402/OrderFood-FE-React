import { useEffect, useState, useRef } from "react";

/**
 * useScrollReveal - Hook tối ưu cho scroll reveal animation
 *
 * Hỗ trợ 2 chế độ sử dụng:
 * 1. Legacy mode (tương thích với code cũ): useScrollReveal(refsArray, options)
 * 2. New mode (trả về ref và state): const [ref, isVisible] = useScrollReveal(options)
 *
 * @param {Object|Array} refOrRefsOrOptions - Có thể là refs array (legacy) hoặc options object (new)
 * @param {Object} optionsLegacy - Options cho legacy mode
 * @returns {void|Array} - Không trả về gì (legacy) hoặc [ref, isVisible] (new)
 */
export default function useScrollReveal(refOrRefsOrOptions, optionsLegacy) {
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState("down");
  const [isVisible, setIsVisible] = useState(false);
  const newRef = useRef();

  // Detect usage mode
  const isLegacyMode =
    (refOrRefsOrOptions && refOrRefsOrOptions.current !== undefined) ||
    (refOrRefsOrOptions && Array.isArray(refOrRefsOrOptions));

  const isNewMode = !isLegacyMode;

  // Get options based on mode
  const options = isLegacyMode
    ? { threshold: 0.01, rootMargin: "0px 0px 150px 0px", ...(optionsLegacy || {}) }
    : { threshold: 0.01, rootMargin: "0px 0px 200px 0px", ...(refOrRefsOrOptions || {}) };

  useEffect(() => {
    // Theo dõi hướng scroll
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? "down" : "up";
      setScrollDirection(direction);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    if (isLegacyMode) {
      // Legacy mode: xử lý array refs
      let elements = Array.isArray(refOrRefsOrOptions.current)
        ? refOrRefsOrOptions.current
        : [refOrRefsOrOptions.current];
      elements = elements.filter((el) => el && el instanceof Element);

      if (!elements.length || !window.IntersectionObserver) {
        window.removeEventListener("scroll", handleScroll);
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const isIntersecting = entry.isIntersecting;
          const rect = entry.boundingClientRect;
          const windowHeight = window.innerHeight;

          // Logic cải tiến: Element sẽ hiện khi có một phần trong viewport
          // và ẩn khi hoàn toàn ra khỏi viewport
          if (isIntersecting) {
            // Element đang giao với viewport -> hiện
            entry.target.classList.add("is-visible");
            entry.target.classList.remove("is-hidden");
          } else {
            // Element không giao với viewport -> ẩn
            // Chỉ ẩn khi element thực sự ra khỏi viewport (với một chút buffer)
            const isCompletelyAbove = rect.bottom < -10;
            const isCompletelyBelow = rect.top > windowHeight + 10;

            if (isCompletelyAbove || isCompletelyBelow) {
              entry.target.classList.remove("is-visible");
              entry.target.classList.add("is-hidden");
            }
          }
        });
      }, options);

      elements.forEach((el) => observer.observe(el));

      // Trigger initial check cho các elements đã có trong viewport
      setTimeout(() => {
        elements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const isInViewport = rect.top < windowHeight && rect.bottom > 0;

          if (isInViewport) {
            el.classList.add("is-visible");
            el.classList.remove("is-hidden");
          }
        });
      }, 50);

      return () => {
        window.removeEventListener("scroll", handleScroll);
        observer.disconnect();
      };
    } else {
      // New mode: xử lý single ref và trả về state
      const observer = new IntersectionObserver(([entry]) => {
        const isIntersecting = entry.isIntersecting;
        const rect = entry.boundingClientRect;
        const windowHeight = window.innerHeight;

        // Logic cải tiến cho new mode
        if (isIntersecting) {
          setIsVisible(true);
        } else {
          // Chỉ ẩn khi element thực sự ra khỏi viewport
          const isCompletelyAbove = rect.bottom < -10;
          const isCompletelyBelow = rect.top > windowHeight + 10;

          if (isCompletelyAbove || isCompletelyBelow) {
            setIsVisible(false);
          }
        }
      }, options);

      if (newRef.current) {
        observer.observe(newRef.current);
      }

      return () => {
        window.removeEventListener("scroll", handleScroll);
        if (newRef.current) {
          observer.unobserve(newRef.current);
        }
      };
    }
  }, [
    isLegacyMode
      ? Array.isArray(refOrRefsOrOptions.current)
        ? refOrRefsOrOptions.current.length
        : undefined
      : undefined,
    options.threshold,
    options.rootMargin,
    refOrRefsOrOptions,
    scrollDirection,
    lastScrollY,
    isLegacyMode,
  ]);

  // Return based on mode
  if (isNewMode) {
    return [newRef, isVisible, scrollDirection];
  }
  // Legacy mode returns nothing (void)
}
