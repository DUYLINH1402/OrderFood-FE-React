import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const ImageLightbox = ({ src, alt = "Ảnh phóng to", onClose }) => {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-zoom-out"
      onClick={onClose}>
      {/* Nút đóng */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[10000] w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white text-2xl transition-colors duration-200"
        aria-label="Đóng">
        ✕
      </button>

      {/* Ảnh full */}
      <img
        src={src}
        alt={alt}
        className="max-w-[92vw] max-h-[90vh] object-contain rounded-lg shadow-2xl select-none"
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />
    </div>,
    document.body
  );
};

export default ImageLightbox;
