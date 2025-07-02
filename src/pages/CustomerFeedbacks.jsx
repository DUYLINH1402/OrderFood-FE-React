import React from "react";

const CustomerFeedbacks = () => {
  return (
    <div
      className="customer-feedbacks-page wrap-page"
      style={{ position: "relative", overflow: "hidden" }}>
      {/* Blob background elements, always at bottom, never break layout */}
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />
      <div className="bg-blob bg-blob-4" />
      <div className="bg-blob bg-blob-5" />
      <div className="bg-blob bg-blob-6" />
      <h1>Đánh Giá Của Khách Hàng</h1>
      {/* Nội dung đánh giá khách hàng sẽ được thêm ở đây */}
      <p>Trang này sẽ hiển thị các đánh giá của khách hàng về dịch vụ và món ăn.</p>
    </div>
  );
};

export default CustomerFeedbacks;
