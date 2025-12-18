import React from "react";
import { CheckCircleIcon, ChatBubbleLeftIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { LazyLoadImage } from "react-lazy-load-image-component";
import icon_staff from "../../../assets/icons/icon_staff.png";
import icon_reply from "../../../assets/icons/icon_reply.svg";

/**
 * Component chung để hiển thị tin nhắn cho cả Staff và Customer
 * Hỗ trợ đầy đủ tính năng reply, trạng thái đọc, avatar...
 */
const ChatMessageItem = ({
  message,
  onReply,
  onMarkAsRead,
  userType = "customer", // "customer" | "staff"
}) => {
  /**
   * Parse timestamp từ nhiều định dạng khác nhau thành Date object
   * Hỗ trợ: Date object, ISO string, timestamp number, "DD/MM/YYYY HH:mm", array [year, month, day, hour, minute, second]
   */
  const parseTimestamp = (timestamp) => {
    if (!timestamp) return null;

    // Nếu đã là Date object
    if (timestamp instanceof Date) {
      return isNaN(timestamp.getTime()) ? null : timestamp;
    }

    // Nếu là number (timestamp milliseconds hoặc seconds)
    if (typeof timestamp === "number") {
      // Nếu timestamp < 10^12, có thể là seconds thay vì milliseconds
      const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
      const date = new Date(ms);
      return isNaN(date.getTime()) ? null : date;
    }

    // Nếu là array [year, month, day, hour, minute, second, nano] (Java LocalDateTime format)
    if (Array.isArray(timestamp) && timestamp.length >= 3) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = timestamp;
      const date = new Date(year, month - 1, day, hour, minute, second);
      return isNaN(date.getTime()) ? null : date;
    }

    // Nếu là string
    if (typeof timestamp === "string") {
      // Thử parse định dạng "DD/MM/YYYY HH:mm" hoặc "DD/MM/YYYY, HH:mm"
      const ddmmyyyyMatch = timestamp.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})[,\s]+(\d{1,2}):(\d{2})$/
      );
      if (ddmmyyyyMatch) {
        const [, day, month, year, hour, minute] = ddmmyyyyMatch;
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hour),
          parseInt(minute)
        );
        return isNaN(date.getTime()) ? null : date;
      }

      // Thử parse định dạng "YYYY-MM-DD HH:mm:ss" (MySQL format)
      const mysqlMatch = timestamp.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):?(\d{2})?/);
      if (mysqlMatch) {
        const [, year, month, day, hour, minute, second = "0"] = mysqlMatch;
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
          parseInt(second)
        );
        return isNaN(date.getTime()) ? null : date;
      }

      // Thử parse ISO string hoặc các format khác
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }

    // Nếu là object có các trường như Java LocalDateTime
    if (typeof timestamp === "object" && timestamp !== null) {
      if (timestamp.year && timestamp.monthValue && timestamp.dayOfMonth) {
        const date = new Date(
          timestamp.year,
          timestamp.monthValue - 1,
          timestamp.dayOfMonth,
          timestamp.hour || 0,
          timestamp.minute || 0,
          timestamp.second || 0
        );
        return isNaN(date.getTime()) ? null : date;
      }
    }

    return null;
  };

  /**
   * Format thời gian tin nhắn theo quy tắc:
   * - Hôm nay: Hiển thị giờ (VD: 14:30)
   * - Hôm qua: Hiển thị "Hôm qua HH:mm"
   * - Trong tuần này: Hiển thị thứ + giờ (VD: "T2 14:30")
   * - Cũ hơn: Hiển thị ngày/tháng + giờ (VD: "12/12 14:30")
   */
  const formatTime = (timestamp) => {
    const date = parseTimestamp(timestamp);
    if (!date) return "";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // Format giờ phút
    const timeStr = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      // Hôm nay: chỉ hiển thị giờ
      if (messageDate.getTime() === today.getTime()) {
        return timeStr;
      }

      // Hôm qua: "Hôm qua HH:mm"
      if (messageDate.getTime() === yesterday.getTime()) {
        return `Hôm qua ${timeStr}`;
      }

      // Trong 7 ngày gần đây: "T2 HH:mm"
      const diffDays = Math.floor((today - messageDate) / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        const dayName = dayNames[date.getDay()];
        return `${dayName} ${timeStr}`;
      }

      // Cũ hơn: "DD/MM HH:mm"
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      return `${day}/${month} ${timeStr}`;
    } catch (error) {
      console.warn("Lỗi format thời gian:", error);
      return "";
    }
  };

  const renderMessageContent = (text) => {
    if (!text || typeof text !== "string") {
      return <span className="text-gray-400">Tin nhắn trống</span>;
    }

    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const getMessageTypeIcon = () => {
    if (message.messageType === "USER_CHAT") {
      return <ChatBubbleLeftIcon className="w-3 h-3 text-blue-500" />;
    } else if (
      message.customerName?.includes("09") ||
      message.customerName?.includes("03") ||
      message.customerName?.includes("07")
    ) {
      return <PhoneIcon className="w-3 h-3 text-green-500" />;
    }
    return null;
  };

  const getSenderInfo = () => {
    // Xác định sender dựa trên message data và userType
    let senderType, senderName, avatar;

    if (message.sender === "staff" || message.staffName || message.senderName) {
      senderType = "staff";
      senderName = message.staffName || message.senderName || "Nhân viên hỗ trợ";
      avatar = icon_staff;
    } else if (message.sender === "user" || message.sender === "customer") {
      senderType = "customer";
      senderName = message.customerName || message.userName || "Khách hàng";
      avatar = message.userAvatar;
    } else {
      // Fallback logic
      senderType = userType === "staff" ? "customer" : "staff";
      senderName = userType === "staff" ? "Khách hàng" : "Nhân viên hỗ trợ";
    }

    return { senderType, senderName, avatar };
  };

  const { senderType, senderName, avatar } = getSenderInfo();
  const isOwnMessage =
    (userType === "staff" && senderType === "staff") ||
    (userType === "customer" && senderType === "customer");

  // Tin nhắn hệ thống
  if (message.sender === "system") {
    return (
      <div className="chat-message-item system">
        <div className="system-message">
          <span className="system-text">{message.text || message.message}</span>
          <span className="system-time">{formatTime(message.timestamp)}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`chat-message-item ${senderType} ${
        isOwnMessage ? "own-message" : "other-message"
      } ${
        !message.isRead && senderType !== (userType === "staff" ? "staff" : "customer")
          ? "unread"
          : ""
      }`}>
      <div className="message-wrapper">
        {/* Avatar bên trái cho tin nhắn từ người khác */}
        {!isOwnMessage && (
          <div className={`message-avatar ${senderType}-avatar`}>
            {senderType === "staff" ? (
              <LazyLoadImage src={icon_staff} alt="Staff" />
            ) : avatar ? (
              <LazyLoadImage
                src={avatar}
                alt={senderName}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            {(!avatar || senderType === "customer") && (
              <span className="user-initial" style={{ display: avatar ? "none" : "flex" }}>
                {senderType === "staff" ? "S" : senderName?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}
          </div>
        )}

        <div className="message-content">
          {/* Header với tên và thời gian cho tin nhắn từ người khác */}
          {!isOwnMessage && (
            <div className="message-header flex items-end">
              <div className="sender-info ">
                {getMessageTypeIcon()}
                {!message.isRead &&
                  senderType !== (userType === "staff" ? "staff" : "customer") && (
                    <span className="unread-indicator" title="Tin nhắn chưa đọc">
                      <div className="unread-dot"></div>
                    </span>
                  )}
              </div>
            </div>
          )}

          <span className="message-time flex justify-center ">{formatTime(message.timestamp)}</span>
          <div
            className="message-bubble"
            onClick={onMarkAsRead && !message.isRead ? onMarkAsRead : undefined}>
            {/* Hiển thị reply reference nếu có */}
            {message.replyTo && (
              <div className="reply-reference">
                <div className="reply-reference-line"></div>
                <div className="reply-reference-content">
                  <div className="reply-reference-text">
                    {(
                      message.replyTo.text ||
                      message.replyTo.content ||
                      message.replyTo.message ||
                      ""
                    ).substring(0, 80)}
                    {(
                      message.replyTo.text ||
                      message.replyTo.content ||
                      message.replyTo.message ||
                      ""
                    ).length > 80 && "..."}
                  </div>
                </div>
              </div>
            )}

            <div className="message-text">
              {renderMessageContent(message.text || message.content || message.message || "")}
            </div>

            {/* Actions cho tin nhắn từ người khác */}
            {!isOwnMessage &&
              onReply &&
              message.id &&
              !message.id.toString().startsWith("msg_") && (
                <div className="message-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReply(message);
                    }}
                    className="reply-btn"
                    title="Phản hồi tin nhắn này">
                    <LazyLoadImage src={icon_reply} alt="Reply" className="w-5 h-5" />
                  </button>
                </div>
              )}

            {/* Footer cho tin nhắn của mình */}
            {isOwnMessage && (
              <div className="message-footer">
                {/* Trạng thái gửi */}
                {message.status && message.status !== "DELIVERED" && (
                  <span className={`message-status ${message.status.toLowerCase()}`}>
                    {message.status === "SENDING" && <div className="sending-spinner"></div>}
                    {message.status === "FAILED" && "Thất bại"}
                  </span>
                )}

                {/* Icon đã gửi thành công */}
                {message.status === "DELIVERED" && (
                  <div className="message-status delivered-status flex items-center">
                    <span className="ml-1">Đã gửi</span>
                  </div>
                )}
                {message.status === "READ" && <p className="message-status read-status">Đã xem</p>}
              </div>
            )}
          </div>
        </div>

        {/* Avatar bên phải cho tin nhắn của mình */}
        {isOwnMessage && (
          <div className={`message-avatar ${senderType}-avatar own-avatar`}>
            {senderType === "staff" ? (
              <LazyLoadImage src={icon_staff} alt="Staff" />
            ) : avatar ? (
              <LazyLoadImage
                src={avatar}
                alt={senderName}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <span className="user-initial" style={{ display: avatar ? "none" : "flex" }}>
              {senderType === "staff" ? "S" : senderName?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
        )}
      </div>

      {/* Hint để đánh dấu đã đọc */}
      {!isOwnMessage && !message.isRead && onMarkAsRead && (
        <div className="mark-as-read-hint">
          <small>Nhấn vào tin nhắn để đánh dấu đã đọc</small>
        </div>
      )}
    </div>
  );
};

export default ChatMessageItem;
