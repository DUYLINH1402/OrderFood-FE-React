import React from "react";

/**
 * GlassPageWrapper: Bọc nội dung với hiệu ứng nền blob và glassmorphism.
 * Sử dụng cho các trang cần giao diện đẹp, đồng nhất.
 * Props:
 *   - children: nội dung trang
 *   - className: thêm class cho box glass (tuỳ chọn)
 *   - boxProps: props cho box glass (tuỳ chọn)
 */
function GlassPageWrapper({ children, className = "", boxProps = {} }) {
  return (
    <div className="wrap-page relative overflow-hidden">
      {/* Hiệu ứng blob nền */}
      <div className="bg-blob bg-blob-1 pointer-events-none select-none"></div>
      <div className="bg-blob bg-blob-2 pointer-events-none select-none"></div>
      <div className="bg-blob bg-blob-3 pointer-events-none select-none"></div>
      <div className="bg-blob bg-blob-4 pointer-events-none select-none"></div>
      <div className="bg-blob bg-blob-5 pointer-events-none select-none"></div>
      <div className="bg-blob bg-blob-6 pointer-events-none select-none"></div>
      <div
        className={
          `glass-box flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 z-10 relative max-w-lg mx-auto w-full ` +
          className
        }
        {...boxProps}>
        {children}
      </div>
    </div>
  );
}

export default GlassPageWrapper;
