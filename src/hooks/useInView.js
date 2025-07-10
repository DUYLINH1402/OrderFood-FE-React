import { useRef, useState, useEffect } from "react";

// Custom hook: kiểm tra phần tử có trong viewport không
export default function useInView(options = {}) {
  const ref = useRef();
  const [inView, setInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);

  // Merge default options
  const mergedOptions = {
    threshold: 0.1,
    triggerOnce: true, // Mặc định chỉ trigger một lần
    ...options,
  };

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;

        if (mergedOptions.triggerOnce) {
          // Chế độ "once": chỉ set true một lần, không bao giờ quay lại false
          if (isIntersecting && !hasBeenInView) {
            setInView(true);
            setHasBeenInView(true);
            // Unobserve sau khi trigger để tối ưu performance
            observer.unobserve(ref.current);
          }
        } else {
          // Chế độ normal: toggle theo intersecting
          setInView(isIntersecting);
        }
      },
      {
        threshold: mergedOptions.threshold,
        rootMargin: mergedOptions.rootMargin || "0px",
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [mergedOptions.threshold, mergedOptions.rootMargin, mergedOptions.triggerOnce, hasBeenInView]);

  return [ref, inView];
}
