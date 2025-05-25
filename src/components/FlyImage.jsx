import React, { forwardRef, useEffect, useRef } from "react";
import placeholder_img from "../assets/images/placeholder_img.png";

const FlyImage = forwardRef(({ src, alt = "image", height, width, className = "" }, ref) => {
  const internalRef = useRef();

  useEffect(() => {
    if (ref && internalRef.current) {
      if (typeof ref === "function") {
        ref(internalRef.current);
      } else {
        ref.current = internalRef.current;
      }
    }
  }, [ref]);

  return (
    <img
      ref={internalRef}
      src={src}
      alt={alt}
      height={height}
      width={width}
      loading="lazy"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = placeholder_img;
      }}
      className={className}
    />
  );
});

export default FlyImage;
