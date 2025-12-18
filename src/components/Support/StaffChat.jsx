import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { XMarkIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { useUserChat } from "../../hooks/useUserChat";
import "../../assets/styles/components/SharedChatStyles.scss";
import icon_staff from "../../assets/icons/icon_staff.png";

// Styles
import "../../assets/styles/components/StaffChat.scss";
import { LazyLoadImage } from "react-lazy-load-image-component";
import ChatReplyInput from "./ChatMessage/ChatReplyInput";
import ChatMessageItem from "./ChatMessage/ChatMessageItem";

const StaffChat = ({ onClose }) => {
  // Redux - Lấy thông tin user để xác thực
  const user = useSelector((state) => state.auth.user);

  // Sử dụng useUserChat hook để quản lý chat
  const {
    chatHistory,
    unreadCount,
    isLoading,
    isLoadingMore,
    isConnected,
    sendMessage: sendChatMessage,
    markAsRead,
    markAllAsRead,
    loadMoreMessages,
    canLoadMore,
    error: chatError,
  } = useUserChat();

  // Local state
  const [input, setInput] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [staffInfo, setStaffInfo] = useState(null);
  const [displayMessages, setDisplayMessages] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Reply functionality state
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [isReplyMode, setIsReplyMode] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  // Khởi tạo khi component mount
  useEffect(() => {
    // Đánh dấu tất cả tin nhắn đã đọc khi mở chat
    if (unreadCount > 0) {
      markAllAsRead();
    }
  }, [unreadCount, markAllAsRead]);

  // Chuyển đổi chatHistory từ hook sang format hiển thị
  useEffect(() => {
    // Kiểm tra chatHistory có phải là array không trước khi map
    if (!Array.isArray(chatHistory)) {
      setDisplayMessages([]);
      return;
    }

    const convertedMessages = chatHistory.map((msg) => {
      // Xác định sender dựa trên messageType và các trường khác
      let sender = "staff"; // default
      let userName = undefined;
      let staffName = undefined;

      if (msg.messageType === "USER_TO_STAFF") {
        // Tin nhắn từ user gửi
        sender = "user";
        userName = user?.fullName || user?.name || "Bạn";
      } else if (msg.messageType === "STAFF_TO_USER" || msg.senderName || msg.staffName) {
        // Tin nhắn từ staff (có senderName hoặc staffName hoặc messageType)
        sender = "staff";
        staffName = msg.senderName || msg.staffName || "Nhân viên hỗ trợ";
      } else if (msg.senderType === "USER") {
        // Fallback: dựa vào senderType
        sender = "user";
        userName = user?.fullName || user?.name || "Bạn";
      } else {
        // Fallback: staff
        sender = "staff";
        staffName = "Nhân viên hỗ trợ";
      }

      // Xử lý replyTo context nếu có
      let replyTo = null;
      if (msg.replyTo || msg.replyToMessageId || msg.replyContext) {
        replyTo = {
          id: msg.replyTo?.id || msg.replyToMessageId,
          text:
            msg.replyTo?.text ||
            msg.replyTo?.content ||
            msg.replyTo?.message ||
            msg.replyContext?.originalText ||
            msg.replyToText ||
            "Tin nhắn được phản hồi",
          sender: msg.replyTo?.sender || "user",
          senderName:
            msg.replyTo?.senderName ||
            msg.replyContext?.originalSender ||
            msg.replyToSenderName ||
            "Bạn",
          timestamp: msg.replyTo?.timestamp || msg.replyContext?.originalTimestamp,
        };
      }

      return {
        id: msg.id || msg.messageId,
        text: msg.message || msg.content,
        sender: sender,
        timestamp: new Date(msg.timestamp || msg.sentAt || msg.createdAt || Date.now()),
        userName: userName,
        staffName: staffName,
        userAvatar: sender === "user" ? user?.avatarUrl : undefined,
        isRead: msg.readAt !== null ? true : msg.isRead !== undefined ? msg.isRead : true,
        status: msg.status || "DELIVERED",
        replyTo: replyTo, // Thêm thông tin reply
      };
    });

    // Sort lại một lần nữa để đảm bảo thứ tự đúng (cũ → mới)
    const sortedMessages = convertedMessages.sort((a, b) => {
      const timeA = new Date(a.timestamp);
      const timeB = new Date(b.timestamp);

      return timeA - timeB;
    });

    setDisplayMessages(sortedMessages);
  }, [chatHistory, user]);

  // Auto scroll khi có tin nhắn mới (chỉ khi đang ở cuối)
  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
    }
  }, [displayMessages, shouldScrollToBottom]);

  // Xử lý scroll để load tin nhắn cũ
  const handleScroll = useCallback(
    async (e) => {
      const container = e.target;
      const { scrollTop, scrollHeight, clientHeight } = container;

      // Kiểm tra xem user có đang ở gần cuối không
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldScrollToBottom(isNearBottom);

      // Load thêm tin nhắn khi scroll gần đến đầu
      if (scrollTop < 100 && canLoadMore && !isLoadingMore) {
        const previousScrollHeight = scrollHeight;

        await loadMoreMessages();

        // Giữ vị trí scroll sau khi load thêm tin nhắn
        setTimeout(() => {
          if (container.scrollHeight > previousScrollHeight) {
            container.scrollTop = container.scrollHeight - previousScrollHeight;
          }
        }, 100);
      }
    },
    [canLoadMore, isLoadingMore, loadMoreMessages]
  );

  // Hiển thị lỗi chat nếu có
  useEffect(() => {
    if (chatError) {
      toast.error(`Lỗi chat: ${chatError}`);
    }
  }, [chatError]);

  // Cập nhật thông tin staff từ tin nhắn
  const updateStaffInfo = (messageData) => {
    if (messageData.staffName || messageData.senderName) {
      setStaffInfo({
        name: messageData.staffName || messageData.senderName || "Nhân viên hỗ trợ",
        department: messageData.department || "Hỗ trợ khách hàng",
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const sendMessage = async (text = input) => {
    if (!text.trim() || !isConnected) return;

    setInput(""); // Clear input ngay lập tức

    try {
      // Sử dụng sendMessage từ useUserChat hook với thông tin reply nếu có
      const success = await sendChatMessage(text.trim(), replyToMessage);

      if (!success) {
        throw new Error("Không thể gửi tin nhắn");
      }

      // Reset reply mode nếu đang reply
      if (isReplyMode) {
        setIsReplyMode(false);
        setReplyToMessage(null);
      }

      // Hiển thị popup thông báo ngắn gọn
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
      }, 3000); // Ẩn sau 3 giây
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      toast.error("Không thể gửi tin nhắn. Vui lòng thử lại.");

      // Khôi phục text trong input nếu gửi thất bại
      setInput(text);

      // Khôi phục reply mode nếu có
      if (replyToMessage) {
        setIsReplyMode(true);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else if (e.key === "Escape" && isReplyMode) {
      // Hủy reply mode khi nhấn Escape
      handleCancelReply();
    }
  };

  // Xử lý khi user click nút Reply
  const handleReplyToMessage = (message) => {
    console.log("🔄 Reply to message:", message);
    setReplyToMessage(message);
    setIsReplyMode(true);
  };

  // Hủy reply mode
  const handleCancelReply = () => {
    setReplyToMessage(null);
    setIsReplyMode(false);
  };

  const getConnectionStatus = () => {
    if (isLoading) return "Đang tải...";
    if (isConnecting) return "Đang kết nối...";
    if (isConnected) return "Đã kết nối";
    return "Chưa kết nối";
  };

  const getConnectionStatusClass = () => {
    if (isLoading || isConnecting) return "connecting";
    if (isConnected) return "online";
    return "offline";
  };

  return (
    <div className="staff-chat-container">
      {/* Header */}
      <div className="staff-chat-header">
        <div className="staff-chat-header-left">
          <div className="staff-chat-avatar">
            <LazyLoadImage src={icon_staff} />
          </div>
          <div className="staff-chat-header-info">
            <span className="staff-chat-title">{staffInfo?.name || "Chat với Nhân viên"}</span>
            <span className={`staff-chat-status ${getConnectionStatusClass()}`}>
              {getConnectionStatus()}
            </span>
          </div>
        </div>

        <div className="staff-chat-header-actions">
          <button
            className="staff-chat-header-btn"
            onClick={() => toast.info("Tính năng đang được phát triển")}
            title="Gọi điện">
            <PhoneIcon className="w-6 h-6" />
          </button>
          <button className="staff-chat-header-btn close-btn" onClick={onClose} title="Đóng">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="staff-chat-messages">
        <div
          className="staff-chat-messages-content"
          ref={messagesContainerRef}
          onScroll={handleScroll}>
          {/* Loading indicator cho tin nhắn cũ hơn */}
          {isLoadingMore && (
            <div className="staff-chat-loading-more">
              <div className="loading-spinner-small"></div>
              <p>Đang tải...</p>
            </div>
          )}

          {/* Nút load thêm tin nhắn cũ (giống CustomerChatPanel) */}
          {canLoadMore && !isLoadingMore && (
            <div className="load-more-container">
              <button className="load-more-btn" onClick={loadMoreMessages}>
                Tải tin nhắn cũ hơn
              </button>
            </div>
          )}

          {/* Loading indicator khi đang tải lịch sử chat lần đầu */}
          {isLoading && displayMessages.length === 0 && (
            <div className="staff-chat-loading">
              <div className="loading-spinner"></div>
              <p>Đang tải...</p>
            </div>
          )}

          {/* Welcome message khi chưa có tin nhắn và không đang loading */}
          {!isLoading && displayMessages.length === 0 && (
            <div className="staff-chat-welcome">
              <div className="welcome-icon">
                <LazyLoadImage src={icon_staff} />
              </div>
              <h4 className="md:text-sm">Chào mừng bạn đến với hỗ trợ trực tuyến!</h4>
              <p>Nhân viên của chúng tôi sẽ hỗ trợ bạn trong thời gian sớm nhất.</p>
              {Array.isArray(chatHistory) && chatHistory.length > 0 && (
                <p className="text-sm opacity-75">
                  Đã tải {chatHistory.length} tin nhắn từ lịch sử trò chuyện.
                </p>
              )}
            </div>
          )}

          {/* Hiển thị tin nhắn */}
          {displayMessages.map((message) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              onReply={handleReplyToMessage}
              onMarkAsRead={
                message.sender === "staff" && !message.isRead
                  ? () => markAsRead(message.id)
                  : undefined
              }
              userType="customer" // Customer view - nhìn từ góc độ khách hàng
              currentUser={user}
            />
          ))}

          {/* Auto scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="staff-chat-input">
        <ChatReplyInput
          input={input}
          setInput={setInput}
          onSend={sendMessage}
          onKeyPress={handleKeyPress}
          onFocus={() => unreadCount > 0 && markAllAsRead()}
          placeholder={isConnected ? "Nhập tin nhắn..." : "Đang kết nối..."}
          disabled={!isConnected}
          isConnected={isConnected}
          replyToMessage={replyToMessage}
          onCancelReply={handleCancelReply}
          maxLength={1000}
          showConnectionWarning={!isConnected}
          connectionWarningText={
            chatError ? `Lỗi kết nối: ${chatError}` : "Vui lòng đăng nhập và kiểm tra kết nối."
          }
          className="staff-chat-input-field"
        />

        {/* Hiển thị số tin nhắn chưa đọc */}
        {unreadCount > 0 && (
          <div className="staff-chat-unread-indicator">
            <span>Bạn có {unreadCount} tin nhắn chưa đọc</span>
            <button onClick={markAllAsRead} className="mark-all-read-btn">
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        )}

        {/* Thông báo xác nhận gửi tin nhắn - popup đơn giản */}
        {showConfirmation && (
          <div className="staff-chat-confirmation">
            <div className="confirmation-content">
              <span className="confirmation-text">Tin nhắn đã được gửi</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffChat;
