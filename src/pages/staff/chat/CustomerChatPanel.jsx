import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  XMarkIcon,
  PaperAirplaneIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  MinusIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import CustomerMessageItem from "./CustomerMessageItem";
import "../../../assets/styles/components/CustomerChatPanel.scss";

const CustomerChatPanel = ({ isOpen, onClose, onMinimize, isMinimized, staffWebSocketClient }) => {
  // Redux - Lấy thông tin staff
  const staff = useSelector((state) => state.auth.user);

  // Local state
  const [customerChats, setCustomerChats] = useState(new Map()); // Map: userId -> chatData
  const [activeCustomerId, setActiveCustomerId] = useState(null);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatPanelRef = useRef(null); // Ref cho click outside detection

  // Khởi tạo WebSocket connection và message handlers
  useEffect(() => {
    if (isOpen && staffWebSocketClient) {
      initializeWebSocketHandlers();
    }
  }, [isOpen, staffWebSocketClient]);

  // Auto scroll khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [customerChats, activeCustomerId]);

  // Focus input khi chuyển customer
  useEffect(() => {
    if (inputRef.current && activeCustomerId) {
      inputRef.current.focus();
    }
  }, [activeCustomerId]);

  // Xử lý click outside để đóng chat panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatPanelRef.current &&
        !chatPanelRef.current.contains(event.target) &&
        isOpen &&
        !isMinimized
      ) {
        onClose();
      }
    };

    if (isOpen && !isMinimized) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isMinimized, onClose]);

  const initializeWebSocketHandlers = () => {
    if (!staffWebSocketClient) {
      toast.error("Không thể kết nối WebSocket");
      return;
    }

    setIsConnected(staffWebSocketClient.isConnected());

    // Đăng ký handler để nhận tin nhắn từ khách hàng
    const unsubscribeCustomerMessage = staffWebSocketClient.addMessageHandler(
      "customerMessage",
      handleCustomerMessage
    );

    // Đăng ký handler cho connection status
    const unsubscribeConnectionStatus = staffWebSocketClient.addMessageHandler(
      "connectionStatus",
      (status) => setIsConnected(status.connected)
    );

    // Cleanup khi component unmount
    return () => {
      if (unsubscribeCustomerMessage) unsubscribeCustomerMessage();
      if (unsubscribeConnectionStatus) unsubscribeConnectionStatus();
    };
  };

  const handleCustomerMessage = (data) => {
    try {
      let messageData;

      if (typeof data === "string") {
        messageData = JSON.parse(data);
      } else {
        messageData = data;
      }

      const customerId = messageData.userId || messageData.customerId;
      const customerName =
        messageData.customerName || messageData.userName || `Khách hàng ${customerId}`;
      const messageText = messageData.message || messageData.content || data.toString();

      if (!customerId) {
        console.warn("Không có customer ID trong tin nhắn:", data);
        return;
      }

      const newMessage = {
        id: Date.now() + Math.random(),
        text: messageText,
        sender: "customer",
        timestamp: new Date(messageData.timestamp || Date.now()),
        customerName,
      };

      setCustomerChats((prev) => {
        const newChats = new Map(prev);
        const existingChat = newChats.get(customerId) || {
          customerId,
          customerName,
          messages: [],
          unreadCount: 0,
          lastMessageTime: new Date(),
        };

        // Thêm tin nhắn mới
        existingChat.messages.push(newMessage);
        existingChat.lastMessageTime = newMessage.timestamp;

        // Tăng unread count nếu không phải chat đang active
        if (activeCustomerId !== customerId) {
          existingChat.unreadCount += 1;
        }

        newChats.set(customerId, existingChat);
        return newChats;
      });

      // Hiển thị notification
      if (activeCustomerId !== customerId) {
        toast.info(`Tin nhắn mới từ ${customerName}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }

      // Tự động chọn customer nếu chưa có ai được chọn
      if (!activeCustomerId) {
        setActiveCustomerId(customerId);
      }
    } catch (error) {
      console.error("Lỗi khi xử lý tin nhắn từ khách hàng:", error);
      toast.error("Lỗi khi nhận tin nhắn");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const sendMessage = async (text = input) => {
    if (!text.trim() || !isConnected || !activeCustomerId) return;

    const activeChat = customerChats.get(activeCustomerId);
    if (!activeChat) return;

    // Thêm tin nhắn của staff vào danh sách
    const staffMessage = {
      id: Date.now(),
      text: text.trim(),
      sender: "staff",
      timestamp: new Date(),
      staffName: staff?.fullName || staff?.name || "Nhân viên",
    };

    setCustomerChats((prev) => {
      const newChats = new Map(prev);
      const chat = newChats.get(activeCustomerId);
      if (chat) {
        chat.messages.push(staffMessage);
        chat.lastMessageTime = staffMessage.timestamp;
      }
      newChats.set(activeCustomerId, chat);
      return newChats;
    });

    setInput(""); // Clear input ngay lập tức

    try {
      // Gửi tin nhắn qua WebSocket
      const success = staffWebSocketClient.sendMessageToCustomer(activeCustomerId, text.trim());

      if (!success) {
        throw new Error("Không thể gửi tin nhắn");
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      toast.error("Không thể gửi tin nhắn. Vui lòng thử lại.");

      // Remove tin nhắn thất bại
      setCustomerChats((prev) => {
        const newChats = new Map(prev);
        const chat = newChats.get(activeCustomerId);
        if (chat) {
          chat.messages = chat.messages.filter((msg) => msg.id !== staffMessage.id);
        }
        newChats.set(activeCustomerId, chat);
        return newChats;
      });

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

  const handleCustomerSelect = (customerId) => {
    setActiveCustomerId(customerId);

    // Đánh dấu đã đọc tin nhắn
    setCustomerChats((prev) => {
      const newChats = new Map(prev);
      const chat = newChats.get(customerId);
      if (chat) {
        chat.unreadCount = 0;
      }
      newChats.set(customerId, chat);
      return newChats;
    });
  };

  const getActiveChat = () => {
    return activeCustomerId ? customerChats.get(activeCustomerId) : null;
  };

  const getCustomerList = () => {
    return Array.from(customerChats.values()).sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );
  };

  const getTotalUnreadCount = () => {
    return Array.from(customerChats.values()).reduce((total, chat) => total + chat.unreadCount, 0);
  };

  if (!isOpen) return null;

  const activeChat = getActiveChat();
  const customerList = getCustomerList();

  if (isMinimized) {
    return (
      <div className={`customer-chat-minimized ${!isOpen ? 'chat-button-exit' : ''}`}>
        <button onClick={onMinimize} className="minimize-btn" title="Mở rộng chat">
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
          {getTotalUnreadCount() > 0 && (
            <span className="unread-badge">{getTotalUnreadCount()}</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={chatPanelRef}
      className={`customer-chat-panel ${!isOpen ? 'chat-panel-exit' : ''}`}
    >
      {/* Header */}
      <div className="customer-chat-header">
        <div className="header-left">
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
          <div className="header-info">
            <span className="title">Chat Khách hàng</span>
            <span className={`status ${isConnected ? "online" : "offline"}`}>
              {isConnected ? "Trực tuyến" : "Ngoại tuyến"}
            </span>
          </div>
        </div>

        <div className="header-actions">
          <button onClick={onMinimize} title="Thu nhỏ">
            <MinusIcon className="w-4 h-4" />
          </button>
          <button onClick={onClose} title="Đóng">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="customer-chat-body">
        {/* Customer List */}
        <div className="customer-list">
          <div className="customer-list-header">
            <h4>Khách hàng ({customerList.length})</h4>
          </div>
          <div className="customer-list-content">
            {customerList.length === 0 ? (
              <div className="no-customers">
                <UserIcon className="w-8 h-8" />
                <span>Chưa có tin nhắn nào</span>
              </div>
            ) : (
              customerList.map((chat) => (
                <div
                  key={chat.customerId}
                  className={`customer-item ${
                    activeCustomerId === chat.customerId ? "active" : ""
                  }`}
                  onClick={() => handleCustomerSelect(chat.customerId)}>
                  <div className="customer-avatar">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="customer-info">
                    <div className="customer-name">
                      {chat.customerName}
                      {chat.unreadCount > 0 && (
                        <span className="unread-count">{chat.unreadCount}</span>
                      )}
                    </div>
                    <div className="last-message">
                      {chat.messages[chat.messages.length - 1]?.text.substring(0, 30) || "..."}
                    </div>
                  </div>
                  <div className="message-time">
                    {chat.lastMessageTime.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {activeChat ? (
            <>
              {/* Active Chat Header */}
              <div className="active-chat-header">
                <UserIcon className="w-5 h-5" />
                <span>{activeChat.customerName}</span>
              </div>

              {/* Messages */}
              <div className="messages-container">
                <div className="messages-content">
                  {activeChat.messages.map((message) => (
                    <CustomerMessageItem key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="chat-input">
                <div className="input-container">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isConnected ? "Nhập tin nhắn..." : "Đang kết nối..."}
                    className="input-field"
                    rows={1}
                    maxLength={1000}
                    disabled={!isConnected}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || !isConnected}
                    className="send-btn"
                    title="Gửi tin nhắn">
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-active-chat">
              <ChatBubbleLeftRightIcon className="w-12 h-12" />
              <h4>Chọn khách hàng để bắt đầu chat</h4>
              <p>Chọn một khách hàng từ danh sách bên trái để xem và trả lời tin nhắn.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerChatPanel;
