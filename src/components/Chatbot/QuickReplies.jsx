import React from "react";

const QuickReplies = ({ onQuickReply, isDisabled = false }) => {
  const quickReplies = [
    {
      id: "menu",
      text: "Thực đơn",
    },
    {
      id: "order",
      text: "Đặt hàng",
    },
    {
      id: "promotion",
      text: "Ưu đãi",
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
