import React, { useState } from "react";
import LazyImage from "../../components/LazyImage";
import ScrollRevealContainer from "../../components/ScrollRevealContainer";
import ImageLightbox from "../../components/ImageLightbox";

// Component riêng cho từng feedback item với scroll reveal
const FeedbackItem = ({ feedback, index, isImage, isVideo }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Mảng màu border xoay vòng để mỗi item có màu riêng
  const borderColors = [
    "border-pink-400 shadow-pink-300",
    "border-violet-400 shadow-violet-300",
    "border-sky-400 shadow-sky-300",
    "border-emerald-400 shadow-emerald-300",
    "border-amber-400 shadow-amber-300",
    "border-rose-400 shadow-rose-300",
  ];

  const borderClass = borderColors[index % borderColors.length];

  return (
    <ScrollRevealContainer
      index={index}
      delayBase={0.03}
      className={`feedback-media-item bg-white/95 rounded-2xl p-6 flex flex-col items-center max-w-[700px] w-full
        border-2 ${borderClass}
        shadow-[0_4px_24px_0] transition-all duration-300
        hover:scale-[1.015] hover:shadow-[0_8px_32px_0]
        relative
      `}>
      {/* Góc trang trí top-left */}
      <span
        className={`absolute top-0 left-0 w-5 h-5 rounded-br-xl rounded-tl-2xl opacity-70
          ${index % borderColors.length === 0 ? "bg-pink-400" : ""}
          ${index % borderColors.length === 1 ? "bg-violet-400" : ""}
          ${index % borderColors.length === 2 ? "bg-sky-400" : ""}
          ${index % borderColors.length === 3 ? "bg-emerald-400" : ""}
          ${index % borderColors.length === 4 ? "bg-amber-400" : ""}
          ${index % borderColors.length === 5 ? "bg-rose-400" : ""}
        `}
      />

      {/* Ưu tiên hiển thị video lên trên nếu có */}
      {isVideo ? (
        <>
          <div className="w-full max-w-[400px] aspect-[9/16] mb-2 bg-black rounded-xl overflow-hidden flex justify-center items-center min-h-[500px]">
            <iframe
              src={feedback.mediaUrl.replace("watch?v=", "embed/")}
              title="feedback-video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full min-h-[500px] aspect-[9/16] bg-black rounded-xl block"
            />
          </div>
          {isImage && (
            <div className="cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
              <LazyImage
                src={feedback.mediaUrl}
                alt="feedback-media"
                className="w-full max-w-[300px] max-h-[400px] object-contain rounded-xl mb-2 shadow hover:opacity-90 transition-opacity"
              />
            </div>
          )}
        </>
      ) : isImage ? (
        <div className="cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
          <LazyImage
            src={feedback.mediaUrl}
            alt="feedback-media"
            className="w-full max-w-[700px] max-h-[400px] object-contain rounded-xl mb-2 shadow hover:opacity-90 transition-opacity"
          />
        </div>
      ) : null}

      {/* Lightbox hiển thị ảnh full */}
      {lightboxOpen && isImage && (
        <ImageLightbox
          src={feedback.mediaUrl}
          alt={feedback.customerName || "Feedback"}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </ScrollRevealContainer>
  );
};

export default FeedbackItem;
