import React, { useEffect, useState, useRef } from "react";
import { getAllFeedbacks } from "../../services/service/feedbackService";
import useScrollReveal from "../../hooks/useScrollReveal";
import Masonry from "react-masonry-css";
import ImageLightbox from "../../components/ImageLightbox";

const FeedbacksGallery = ({ showViewMoreButton = true, onViewMore }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [containerRef, isContainerVisible] = useScrollReveal({ threshold: 0.1 });
  const [galleryRef, areItemsVisible] = useScrollReveal({ threshold: 0.15 });
  const [randomHeights, setRandomHeights] = useState([]);
  const masonryRef = useRef(null);

  useEffect(() => {
    getAllFeedbacks()
      .then((data) => {
        setFeedbacks(Array.isArray(data) ? data : data?.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Tính toán random heights khi feedbacks thay đổi với distribution đẹp hơn
  useEffect(() => {
    if (feedbacks.length > 0) {
      const imageFeedbacks = feedbacks.filter((fb) => fb.type === "IMAGE" && fb.mediaUrl);
      const heights = imageFeedbacks.slice(0, 9).map((_, index) => {
        // Tạo pattern heights theo tỷ lệ vàng và đa dạng
        const heightOptions = [260, 290, 320, 280, 350, 300, 380, 270, 330];
        const baseHeight = heightOptions[index % heightOptions.length];

        // Thêm random variation nhỏ để tạo sự tự nhiên
        const variation = Math.floor(Math.random() * 30) - 15; // ±15px
        const finalHeight = baseHeight + variation;

        // Đảm bảo height trong khoảng hợp lý
        return Math.max(250, Math.min(400, finalHeight));
      });
      setRandomHeights(heights);
    }
  }, [feedbacks]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Đang tải đánh giá...</div>;
  }

  if (!feedbacks.length) {
    return (
      <div className="text-center text-md md:text-base py-8 text-gray-400">
        Chưa có đánh giá nào.
      </div>
    );
  }

  // Lọc và giới hạn 9 ảnh đầu tiên
  const imageFeedbacks = feedbacks.filter((fb) => fb.type === "IMAGE" && fb.mediaUrl);
  const displayedFeedbacks = imageFeedbacks.slice(0, 9);
  const hasMoreImages = imageFeedbacks.length > 9;

  // Breakpoints cho masonry với spacing tốt hơn
  const breakpointColumnsObj = {
    default: 3,
    1024: 3,
    768: 2,
    640: 1,
  };

  // Mảng màu border xoay vòng (đồng bộ với FeedbackItem)
  const borderColors = [
    { border: "border-pink-400", shadow: "shadow-pink-300", dot: "bg-pink-400" },
    { border: "border-violet-400", shadow: "shadow-violet-300", dot: "bg-violet-400" },
    { border: "border-sky-400", shadow: "shadow-sky-300", dot: "bg-sky-400" },
    { border: "border-emerald-400", shadow: "shadow-emerald-300", dot: "bg-emerald-400" },
    { border: "border-amber-400", shadow: "shadow-amber-300", dot: "bg-amber-400" },
    { border: "border-rose-400", shadow: "shadow-rose-300", dot: "bg-rose-400" },
  ];

  return (
    <div
      ref={containerRef}
      className={`glass-box scroll-reveal gallery-container w-full p-12 ${
        isContainerVisible ? "is-visible" : "is-hidden"
      }`}>
      <div ref={galleryRef}>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid_column">
          {displayedFeedbacks.map((fb, idx) => {
            const color = borderColors[idx % borderColors.length];

            return (
              <div
                key={fb.id || idx}
                className={`gallery-reveal mb-4 rounded-xl overflow-hidden bg-white
                  border-2 ${color.border} ${color.shadow}
                  shadow-[0_6px_20px_0]
                  hover:shadow-[0_8px_32px_0]
                  transition-all duration-300 cursor-zoom-in
                  transform hover:-translate-y-1 hover:scale-[1.005]
                  relative
                  ${areItemsVisible ? "is-visible" : "is-hidden"}
                `}
                style={{
                  height: `${randomHeights[idx] || 300}px`,
                  aspectRatio: "auto",
                }}
                onClick={() => setLightboxSrc(fb.mediaUrl)}>
                {/* Góc trang trí top-left */}
                <span
                  className={`absolute top-0 left-0 w-5 h-5 rounded-br-xl rounded-tl-xl z-10 opacity-70 ${color.dot}`}
                />

                <img
                  src={fb.mediaUrl}
                  alt={fb.customerName || "Feedback image"}
                  className="gallery-image w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
              </div>
            );
          })}
        </Masonry>
      </div>

      {/* Nút xem thêm */}
      {hasMoreImages && showViewMoreButton && (
        <div className="text-center mt-8">
          <button
            onClick={onViewMore}
            className="px-8 py-3 bg-[#199b7e] text-white text-md md:text-base font-medium rounded-lg hover:bg-green-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Xem thêm ({imageFeedbacks.length - 9} ảnh)
          </button>
        </div>
      )}

      {/* Lightbox hiển thị ảnh full */}
      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt="Đánh giá khách hàng"
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </div>
  );
};

export default FeedbacksGallery;
