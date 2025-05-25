import React, { forwardRef } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import placeholder_img from "../assets/images/placeholder_img.png";
import "./styles/LazyImage.scss";

const LazyImage = forwardRef(({ src, alt = "image", height, width, className = "" }, ref) => {
  const handleError = (e) => {
    e.target.onerror = null;
    e.target.src = placeholder_img;
  };

  return (
    <LazyLoadImage
      ref={ref} // truyền ref vào ảnh
      src={src}
      alt={alt}
      height={height}
      width={width}
      effect="blur"
      offset={100}
      placeholderSrc={placeholder_img}
      className={className}
      onError={handleError}
    />
  );
});

export default LazyImage;
