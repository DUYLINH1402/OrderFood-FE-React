// src/components/common/LazyImage.jsx
import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import placeholder_img from "../assets/images/placeholder_img.png";
import "./styles/LazyImage.scss";

const LazyImage = ({ src, alt = "image", height, width, className = "" }) => {
  const handleError = (e) => {
    e.target.onerror = null;
    e.target.src = fallback;
  };

  return (
    <LazyLoadImage
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
};

export default LazyImage;
