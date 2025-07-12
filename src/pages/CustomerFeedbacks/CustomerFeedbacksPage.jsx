import React, { useEffect, useState } from "react";
import { getAllFeedbacks } from "../../services/service/feedbackService";
import ScrollRevealContainer from "../../components/ScrollRevealContainer";
import FeedbackItem from "./FeedbackItem";

const CustomerFeedbacksPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      <ScrollRevealContainer className="dongxanh-section-title">
        Đánh Giá Của Khách Hàng
      </ScrollRevealContainer>

      {loading && <p>Đang tải đánh giá...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <ScrollRevealContainer
          index={1}
          delayBase={0.3}
          className="feedback-media-list w-full max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 justify-center mt-10 box-border">
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
        </ScrollRevealContainer>
      )}
    </div>
  );
};

export default CustomerFeedbacksPage;
