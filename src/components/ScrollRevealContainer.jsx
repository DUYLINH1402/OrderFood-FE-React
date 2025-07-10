import React, { useRef, useEffect } from "react";
import useScrollReveal from "../hooks/useScrollReveal";

/**
 * ScrollRevealContainer - Component wrapper để dễ dàng thêm scroll reveal animation
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Nội dung bên trong
 * @param {string} props.className - CSS class thêm vào
 * @param {Object} props.style - Inline styles
 * @param {number} props.index - Index để tính delay (mặc định 0)
 * @param {number} props.delayBase - Base delay giữa các items (mặc định 0.08)
 * @param {string} props.as - HTML tag để render (mặc định 'div')
 * @returns {React.ReactElement}
 */
const ScrollRevealContainer = ({
  children,
  className = "",
  style = {},
  index = 0,
  delayBase = 0.08,
  as: Component = "div",
  ...props
}) => {
  const containerRef = useRef();

  // Auto setup scroll reveal cho single element
  useEffect(() => {
    if (containerRef.current) {
      // Thêm class và trigger check
      containerRef.current.classList.add("scroll-reveal");

      // Check initial viewport
      const checkInitialViewport = () => {
        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const isInViewport = rect.top < windowHeight && rect.bottom > 0;

        if (isInViewport) {
          containerRef.current.classList.add("is-visible");
          containerRef.current.classList.remove("is-hidden");
        }
      };

      // Check ngay lập tức và sau một delay nhỏ
      checkInitialViewport();
      setTimeout(checkInitialViewport, 50);

      // Setup intersection observer
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const isIntersecting = entry.isIntersecting;
            const rect = entry.boundingClientRect;
            const windowHeight = window.innerHeight;

            if (isIntersecting) {
              entry.target.classList.add("is-visible");
              entry.target.classList.remove("is-hidden");
            } else {
              const isCompletelyAbove = rect.bottom < -10;
              const isCompletelyBelow = rect.top > windowHeight + 10;

              if (isCompletelyAbove || isCompletelyBelow) {
                entry.target.classList.remove("is-visible");
                entry.target.classList.add("is-hidden");
              }
            }
          });
        },
        {
          threshold: 0.01,
          rootMargin: "0px 0px 200px 0px",
        }
      );

      observer.observe(containerRef.current);

      return () => {
        if (containerRef.current) {
          observer.unobserve(containerRef.current);
        }
      };
    }
  }, []);

  const delayStyle = {
    transitionDelay: `${delayBase * index}s`,
    ...style,
  };

  return (
    <Component
      ref={containerRef}
      className={`scroll-reveal ${className}`}
      style={delayStyle}
      {...props}>
      {children}
    </Component>
  );
};

export default ScrollRevealContainer;
