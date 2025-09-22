import React from "react";
import { UserIcon, ClockIcon } from "@heroicons/react/24/outline";

const StaffMessageItem = ({ message }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const renderMessageContent = (text) => {
    // Xử lý text với line breaks
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  if (message.sender === "system") {
    return (
      <div className="staff-message-item system">
        <div className="system-message">
          <span className="system-text">{message.text}</span>
          <span className="system-time">{formatTime(message.timestamp)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`staff-message-item ${message.sender}`}>
      <div className="message-wrapper">
        {message.sender === "staff" && (
          <div className="message-avatar">
            <UserIcon className="w-6 h-6" />
          </div>
        )}
        
        <div className="message-content">
          {message.sender === "staff" && (
            <div className="message-header">
              <span className="sender-name">
                {message.staffName || "Nhân viên hỗ trợ"}
              </span>
              <span className="message-time">
                <ClockIcon className="w-3 h-3" />
                {formatTime(message.timestamp)}
              </span>
            </div>
          )}
          
          <div className="message-bubble">
            <div className="message-text">
              {renderMessageContent(message.text)}
            </div>
            
            {message.sender === "user" && (
              <div className="message-footer">
                <span className="message-time">
                  <ClockIcon className="w-3 h-3" />
                  {formatTime(message.timestamp)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {message.sender === "user" && (
          <div className="message-avatar user-avatar">
            <span className="user-initial">
              {message.userName?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffMessageItem;