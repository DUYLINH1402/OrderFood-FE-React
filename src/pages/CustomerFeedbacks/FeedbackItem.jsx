import React from "react";
import LazyImage from "../../components/LazyImage";
import ScrollRevealContainer from "../../components/ScrollRevealContainer";

// Component riêng cho từng feedback item với scroll reveal
const FeedbackItem = ({ feedback, index, isImage, isVideo }) => {
  return (
    <ScrollRevealContainer
      index={index}
      delayBase={0.03}
      className="feedback-media-item bg-white/95 rounded-2xl shadow-lg p-6 flex flex-col items-center max-w-[700px] w-full">
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
            <LazyImage
              src={feedback.mediaUrl}
              alt="feedback-media"
              className="w-full max-w-[600px] max-h-[800px] object-contain rounded-xl mb-2 shadow"
            />
          )}
        </>
      ) : isImage ? (
        <LazyImage
          src={feedback.mediaUrl}
          alt="feedback-media"
          className="w-full max-w-[600px] max-h-[800px] object-contain rounded-xl mb-2 shadow"
        />
      ) : null}
    </ScrollRevealContainer>
  );
};

export default FeedbackItem;
