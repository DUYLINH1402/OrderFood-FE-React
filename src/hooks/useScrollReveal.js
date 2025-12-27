import { useEffect, useState, useRef } from "react";

/**
 * useScrollReveal - Hook tối ưu cho scroll reveal animation
 *
 * Hiệu ứng chỉ xuất hiện MỘT LẦN DUY NHẤT khi element vào viewport (cuộn xuống).
 * Sau khi đã hiện, element sẽ giữ nguyên trạng thái visible, không ẩn lại.
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
  const [isVisible, setIsVisible] = useState(false);
  const newRef = useRef();
  // Set để theo dõi các element đã được reveal (chỉ reveal 1 lần)
  const revealedElementsRef = useRef(new Set());

  // Detect usage mode
  const isLegacyMode =
    (refOrRefsOrOptions && refOrRefsOrOptions.current !== undefined) ||
    (refOrRefsOrOptions && Array.isArray(refOrRefsOrOptions));

  const isNewMode = !isLegacyMode;

  // Get options based on mode
  const options = isLegacyMode
    ? { threshold: 0.1, rootMargin: "0px 0px -50px 0px", ...(optionsLegacy || {}) }
    : { threshold: 0.1, rootMargin: "0px 0px -50px 0px", ...(refOrRefsOrOptions || {}) };

  useEffect(() => {
    if (isLegacyMode) {
      // Legacy mode: xử lý array refs
      let elements = Array.isArray(refOrRefsOrOptions.current)
        ? refOrRefsOrOptions.current
        : [refOrRefsOrOptions.current];
      elements = elements.filter((el) => el && el instanceof Element);

      if (!elements.length || !window.IntersectionObserver) {
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          // Chỉ xử lý khi element vào viewport và chưa được reveal
          if (entry.isIntersecting && !revealedElementsRef.current.has(entry.target)) {
            // Đánh dấu element đã được reveal
            revealedElementsRef.current.add(entry.target);
            // Thêm class visible (chỉ 1 lần, không bao giờ xóa)
            entry.target.classList.add("is-visible");
            entry.target.classList.remove("is-hidden");
            // Ngừng observe element này vì đã reveal xong
            observer.unobserve(entry.target);
          }
        });
      }, options);

      elements.forEach((el) => {
        // Chỉ observe những element chưa được reveal
        if (!revealedElementsRef.current.has(el)) {
          observer.observe(el);
        }
      });

      // Trigger initial check cho các elements đã có trong viewport
      setTimeout(() => {
        elements.forEach((el) => {
          if (revealedElementsRef.current.has(el)) return;

          const rect = el.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const isInViewport = rect.top < windowHeight && rect.bottom > 0;

          if (isInViewport) {
            revealedElementsRef.current.add(el);
            el.classList.add("is-visible");
            el.classList.remove("is-hidden");
            observer.unobserve(el);
          }
        });
      }, 50);

      return () => {
        observer.disconnect();
      };
    } else {
      // New mode: xử lý single ref và trả về state
      // Nếu đã visible rồi thì không cần observe nữa
      if (isVisible) return;

      const observer = new IntersectionObserver(([entry]) => {
        // Chỉ set visible khi element vào viewport (chỉ 1 lần)
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          // Ngừng observe vì đã reveal xong
          observer.disconnect();
        }
      }, options);

      if (newRef.current) {
        observer.observe(newRef.current);
      }

      return () => {
        observer.disconnect();
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
    isLegacyMode,
    isVisible,
  ]);

  // Return based on mode
  if (isNewMode) {
    return [newRef, isVisible];
  }
  // Legacy mode returns nothing (void)
}
