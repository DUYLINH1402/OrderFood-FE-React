import React from "react";

const TypingIndicator = ({ isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <div className="message bot typing-message">
      <div className="message-content typing">
        <div className="typing-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        <span className="typing-text">Đang nhập...</span>
      </div>
    </div>
  );
};

export default TypingIndicator;
