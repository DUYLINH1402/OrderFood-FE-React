import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { XMarkIcon, PaperAirplaneIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import userWebSocketClient from "../../services/websocket/userWebSocketClient";
import StaffMessageItem from "./StaffMessageItem";
import icon_staff from "../../assets/icons/icon_staff.png";

// Styles
import "../../assets/styles/components/StaffChat.scss";
import { LazyLoadImage } from "react-lazy-load-image-component";

const StaffChat = ({ onClose }) => {
  // Redux - Lấy thông tin user để xác thực
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  // Local state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [staffInfo, setStaffInfo] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Khởi tạo kết nối WebSocket và subscribe messages khi component mount
  useEffect(() => {
    initializeWebSocketConnection();

    // Focus vào input khi chat mở
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Cleanup khi component unmount
    return () => {
      // Không disconnect hoàn toàn để giữ kết nối cho notifications
      // Chỉ cleanup handler của staff chat
    };
  }, []);

  // Auto scroll khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeWebSocketConnection = async () => {
    try {
      setIsConnecting(true);

      // Kết nối WebSocket nếu chưa kết nối
      if (!userWebSocketClient.isConnected()) {
        await userWebSocketClient.connect(user.id, token);
      }

      setIsConnected(true);

      // Đăng ký handler để nhận tin nhắn từ staff
      const unsubscribe = userWebSocketClient.addMessageHandler("staffMessage", handleStaffMessage);

      // Gửi thông báo bắt đầu chat session
      sendSystemMessage("Đã kết nối với nhân viên hỗ trợ");

      // Cleanup function sẽ được trả về cho useEffect
      return unsubscribe;
    } catch (error) {
      console.error("Lỗi khi kết nối WebSocket:", error);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStaffMessage = (data) => {
    try {
      // Xử lý tin nhắn từ staff
      let messageData;

      if (typeof data === "string") {
        // Nếu là string, parse JSON
        messageData = JSON.parse(data);
      } else {
        // Nếu đã là object
        messageData = data;
      }

      const newMessage = {
        id: Date.now(),
        text: messageData.message || messageData.content || data,
        sender: "staff",
        timestamp: new Date(),
        staffName: messageData.staffName || "Nhân viên hỗ trợ",
      };

      setMessages((prev) => [...prev, newMessage]);

      // Cập nhật thông tin staff nếu có
      if (messageData.staffName) {
        setStaffInfo({
          name: messageData.staffName,
          department: messageData.department || "Hỗ trợ khách hàng",
        });
      }
    } catch (error) {
      console.error("Lỗi khi xử lý tin nhắn từ staff:", error);
      // Fallback: hiển thị tin nhắn raw
      const newMessage = {
        id: Date.now(),
        text: data.toString(),
        sender: "staff",
        timestamp: new Date(),
        staffName: "Nhân viên hỗ trợ",
      };
      setMessages((prev) => [...prev, newMessage]);
    }
  };

  const sendSystemMessage = (text) => {
    const systemMessage = {
      id: Date.now(),
      text,
      sender: "system",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, systemMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const sendMessage = async (text = input) => {
    if (!text.trim() || !isConnected) return;

    // Thêm tin nhắn của user vào danh sách
    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
      userName: user?.fullName || user?.name || "Bạn",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput(""); // Clear input ngay lập tức

    try {
      // Gửi tin nhắn qua WebSocket
      const success = userWebSocketClient.chatToStaff(text.trim());

      if (!success) {
        throw new Error("Không thể gửi tin nhắn");
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      toast.error("Không thể gửi tin nhắn. Vui lòng thử lại.");

      // Remove tin nhắn thất bại
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));

      // Khôi phục text trong input
      setInput(text);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const getConnectionStatus = () => {
    if (isConnecting) return "Đang kết nối...";
    if (isConnected) return "Đã kết nối";
    return "Chưa kết nối";
  };

  const getConnectionStatusClass = () => {
    if (isConnecting) return "connecting";
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
            <PhoneIcon className="w-7 h-7" />
          </button>
          <button className="staff-chat-header-btn close-btn" onClick={onClose} title="Đóng">
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="staff-chat-messages">
        <div className="staff-chat-messages-content">
          {messages.length === 0 && (
            <div className="staff-chat-welcome ">
              <div className="welcome-icon">
                <LazyLoadImage src={icon_staff} />
              </div>
              <h4 className="md:text-sm">Chào mừng bạn đến với hỗ trợ trực tuyến!</h4>
              <p>Nhân viên của chúng tôi sẽ hỗ trợ bạn trong thời gian sớm nhất.</p>
            </div>
          )}

          {messages.map((message) => (
            <StaffMessageItem key={message.id} message={message} />
          ))}

          {/* Auto scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="staff-chat-input">
        <div className="staff-chat-input-container">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Nhập tin nhắn..." : "Đang kết nối..."}
            className="staff-chat-input-field"
            rows={1}
            maxLength={1000}
            disabled={!isConnected}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || !isConnected}
            className="staff-chat-send-btn"
            title="Gửi tin nhắn">
            <PaperAirplaneIcon className="w-7 h-7" />
          </button>
        </div>

        {!isConnected && (
          <div className="staff-chat-connection-warning">
            <span>Vui lòng đăng nhập và kiểm tra kết nối.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffChat;
