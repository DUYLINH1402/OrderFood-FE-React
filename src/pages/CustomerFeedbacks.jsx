import React, { useEffect, useState } from "react";
import { getAllFeedbacks } from "../services/service/feedbackService";
import useScrollReveal from "../hooks/useScrollReveal";
import LazyImage from "../components/LazyImage";
// Component riêng cho từng feedback item với scroll reveal
const FeedbackItem = ({ feedback, index, isImage, isVideo }) => {
  const [itemRef, itemVisible] = useScrollReveal({
    threshold: 0.05,
    rootMargin: "0px 0px 200px 0px",
  });

  return (
    <div
      ref={itemRef}
      className={`feedback-media-item bg-white/95 rounded-2xl shadow-lg p-6 flex flex-col items-center max-w-[700px] w-full transition-all duration-700 ease-out ${
        itemVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
      }`}
      style={{
        transitionDelay: `${index * 50}ms`, // Giảm delay cho animation nhanh hơn
      }}>
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
    </div>
  );
};

const CustomerFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Scroll reveal hooks cho các elements
  const [titleRef, titleVisible] = useScrollReveal({
    threshold: 0.05,
    rootMargin: "0px 0px 150px 0px",
  });
  const [gridRef, gridVisible] = useScrollReveal({
    threshold: 0.02,
    rootMargin: "0px 0px 250px 0px",
  });

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllFeedbacks();
        console.log("Feedbacks fetched:", data);
        setFeedbacks(data || []);
      } catch (err) {
        setError("Không thể tải đánh giá khách hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  return (
    <div className="customer-feedbacks-page wrap-page px-4 pt-[100px] md:px-8 lg:px-16 relative overflow-hidden">
      {/* Blob background elements, always at bottom, never break layout */}
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />
      <div className="bg-blob bg-blob-4" />
      <div className="bg-blob bg-blob-5" />
      <div className="bg-blob bg-blob-6" />
      <h1
        ref={titleRef}
        className={`dongxanh-section-title transition-all duration-700 ease-out ${
          titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
        Đánh Giá Của Khách Hàng
      </h1>

      {loading && <p>Đang tải đánh giá...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <div
          ref={gridRef}
          className={`feedback-media-list w-full max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 justify-center mt-10 box-border transition-all duration-700 ease-out ${
            gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}>
          {feedbacks.length === 0 ? (
            <p>Chưa có đánh giá nào.</p>
          ) : (
            feedbacks.map((fb, idx) => {
              const isImage = fb.type === "IMAGE" && fb.mediaUrl;
              const isVideo = fb.type === "VIDEO" && fb.mediaUrl;
              if (!isImage && !isVideo) return null;
              return (
                <FeedbackItem
                  key={fb.id || idx}
                  feedback={fb}
                  index={idx}
                  isImage={isImage}
                  isVideo={isVideo}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerFeedbacks;
