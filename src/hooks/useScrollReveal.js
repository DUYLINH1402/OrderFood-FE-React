import { useEffect } from "react";

/**
 * useScrollReveal
 * Adds scroll-reveal animation to any element ref (single or array).
 * Usage: const ref = useRef(); useScrollReveal(ref);
 *        or for multiple: const refs = useRef([]); useScrollReveal(refs);
 */
export default function useScrollReveal(refOrRefs, options) {
  // Default: threshold thấp và rootMargin để dễ trigger hơn
  const mergedOptions = { threshold: 0.08, rootMargin: "-50px 0px", ...(options || {}) };
  useEffect(() => {
    let elements = Array.isArray(refOrRefs.current) ? refOrRefs.current : [refOrRefs.current];
    elements = elements.filter((el) => el && el instanceof Element);
    if (!elements.length || !window.IntersectionObserver) return;
    const observer = new window.IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Debug log
        // console.log('ScrollReveal:', entry.target, entry.isIntersecting);
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, mergedOptions);
    elements.forEach((el) => {
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [
    Array.isArray(refOrRefs.current) ? refOrRefs.current.length : undefined,
    mergedOptions.threshold,
    mergedOptions.rootMargin,
    refOrRefs,
  ]);
}
