import React from "react";

const MessageItem = ({ message }) => {
  const { text, sender, timestamp, isWelcome, isError, isLoading } = message;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Component cho loading indicator với 3 chấm động
  const LoadingIndicator = () => (
    <div className="loading-indicator">
      <span className="loading-dot"></span>
      <span className="loading-dot"></span>
      <span className="loading-dot"></span>
    </div>
  );

  return (
    <div
      className={`message ${sender} ${isWelcome ? "welcome-message" : ""} ${
        isError ? "error-message" : ""
      } ${isLoading ? "loading-message" : ""}`}>
      <div className="message-content">
        <div className="message-text">
          {isLoading ? (
            <LoadingIndicator />
          ) : (
            <pre
              style={{
                display: "inline",
                whiteSpace: "pre-wrap",
                margin: 0,
                fontFamily: "inherit",
              }}>
              {text}
            </pre>
          )}
        </div>

        {/* Thời gian tin nhắn - không hiển thị cho loading message */}
        {!isLoading && <div className="message-timestamp">{formatTime(timestamp)}</div>}
      </div>
    </div>
  );
};

export default MessageItem;
