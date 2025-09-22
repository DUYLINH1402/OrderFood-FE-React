import React from "react";
import { UserIcon, ClockIcon, CheckIcon } from "@heroicons/react/24/outline";

const CustomerMessageItem = ({ message }) => {
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

  return (
    <div className={`customer-message-item ${message.sender}`}>
      <div className="message-wrapper">
        {message.sender === "customer" && (
          <div className="message-avatar customer-avatar">
            <UserIcon className="w-4 h-4" />
          </div>
        )}
        
        <div className="message-content">
          {message.sender === "customer" && (
            <div className="message-header">
              <span className="sender-name">
                {message.customerName || "Khách hàng"}
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
            
            {message.sender === "staff" && (
              <div className="message-footer">
                <span className="message-time">
                  <ClockIcon className="w-3 h-3" />
                  {formatTime(message.timestamp)}
                </span>
                <CheckIcon className="w-3 h-3 delivered-icon" />
              </div>
            )}
          </div>
        </div>
        
        {message.sender === "staff" && (
          <div className="message-avatar staff-avatar">
            <span className="staff-initial">
              {message.staffName?.charAt(0)?.toUpperCase() || "S"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerMessageItem;