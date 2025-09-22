import React from "react";

const QuickReplies = ({ onQuickReply, isDisabled = false }) => {
  const quickReplies = [
    {
      id: "menu",
      text: "Xem thực đơn",
      icon: "🍽️",
    },
    {
      id: "order",
      text: "Đặt hàng",
      icon: "🛒",
    },
    {
      id: "delivery",
      text: "Giao hàng",
      icon: "🚚",
    },
    {
      id: "payment",
      text: "Thanh toán",
      icon: "💳",
    },
    {
      id: "support",
      text: "Hỗ trợ",
      icon: "💬",
    },
    {
      id: "promotion",
      text: "Ưu đãi",
      icon: "🎁",
    },
  ];

  return (
    <div className="chatbot-quick-replies">
      <div className="quick-replies-grid">
        {quickReplies.map((reply) => (
          <button
            key={reply.id}
            onClick={() => onQuickReply(reply.text)}
            disabled={isDisabled}
            className="quick-reply-button"
            title={reply.text}>
            <span className="quick-reply-text">{reply.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickReplies;
