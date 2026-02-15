import React from "react";

/**
 * GlassPageWrapper: Bọc nội dung với hiệu ứng nền blob và glassmorphism.
 * Sử dụng cho các trang cần giao diện đẹp, đồng nhất.
 * Props:
 *   - children: nội dung trang
 *   - className: thêm class cho wrapper (tuỳ chọn)
 *   - boxProps: props cho wrapper (tuỳ chọn)
 */
function GlassPageWrapper({ children, className = "", boxProps = {} }) {
  return (
    <div className={`wrap-page relative ${className}`} {...boxProps}>
      {/* Hiệu ứng blob nền */}
      <div className="bg-blob bg-blob-1 pointer-events-none select-none"></div>
      <div className="bg-blob bg-blob-2 pointer-events-none select-none"></div>
      <div className="bg-blob bg-blob-3 pointer-events-none select-none"></div>
      <div className="bg-blob bg-blob-4 pointer-events-none select-none"></div>
      <div className="bg-blob bg-blob-5 pointer-events-none select-none"></div>
      <div className="bg-blob bg-blob-6 pointer-events-none select-none"></div>
      {/* Nội dung trang - không dùng glass-box để tránh 2 thanh scroll */}
      <div className="w-full mt-[30px] z-10 relative">{children}</div>
    </div>
  );
}

export default GlassPageWrapper;
