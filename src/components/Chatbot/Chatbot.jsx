import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import icon_bot from "../../assets/icons/icon_bot.png";
import { XMarkIcon, PaperAirplaneIcon, PlusIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

// Redux actions and selectors
import {
  sendChatMessage,
  initializeSession,
  clearSession,
  addUserMessage,
  addLoadingMessage,
  selectMessages,
  selectIsLoading,
  selectSessionId,
  selectChatbotError,
  selectChatbotSettings,
} from "../../store/slices/chatbotSlice";

// Components
import MessageItem from "./MessageItem";
import QuickReplies from "./QuickReplies";
import { useConfirm } from "../ConfirmModal";

// Styles
import "../../assets/styles/components/Chatbot.scss";

const Chatbot = ({ onClose }) => {
  // Redux
  const dispatch = useDispatch();
  const messages = useSelector(selectMessages);
  const isLoading = useSelector(selectIsLoading);
  const sessionId = useSelector(selectSessionId);
  const error = useSelector(selectChatbotError);
  const settings = useSelector(selectChatbotSettings);

  // Confirm modal hook
  const confirm = useConfirm();

  // Local state
  const [input, setInput] = useState("");

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get user info from Redux auth state
  const user = useSelector((state) => state.auth.user);

  // Initialize session when component mounts
  useEffect(() => {
    if (!sessionId) {
      dispatch(initializeSession({ userId: user?.id }));
    }
  }, [dispatch, sessionId, user?.id]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (settings.autoScroll) {
      scrollToBottom();
    }
  }, [messages, settings.autoScroll]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [error]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const sendMessage = async (text = input) => {
    if (!text.trim() || isLoading) return;

    const messageText = text.trim();

    // Clear input immediately
    setInput("");

    try {
      // Thêm tin nhắn của user ngay lập tức
      dispatch(addUserMessage({ text: messageText }));

      // Thêm loading message để hiển thị bot đang xử lý
      dispatch(addLoadingMessage());

      // Gửi yêu cầu đến backend
      await dispatch(
        sendChatMessage({
          message: messageText,
          sessionId: sessionId,
        })
      ).unwrap();

      // Play notification sound if enabled
      if (settings.enableSound) {
        playNotificationSound();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Lỗi sẽ được xử lý bởi Redux slice và useEffect phía trên
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
  };

  const handleQuickReply = (text) => {
    sendMessage(text);
  };

  const playNotificationSound = () => {
    try {
      // Simple beep sound - you can replace with actual sound file
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocBjiS2PTE"
      );
      audio.volume = 0.1;
      audio.play().catch(() => {
        // Ignore audio play errors (browser restrictions)
      });
    } catch (error) {
      console.log("Could not play notification sound:", error);
    }
  };

  const clearCurrentSession = () => {
    dispatch(clearSession());
    dispatch(initializeSession({ userId: user?.id }));
  };

  return (
    <div className="chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-header-left">
          <div className="chatbot-avatar">
            <span className="chatbot-avatar-icon">
              <img src={icon_bot} alt="Chatbot icon" />
            </span>
          </div>
          <div className="chatbot-header-info">
            <span className="chatbot-title">Trợ Lý FoodBot</span>
            <span className="chatbot-status">{isLoading ? "Đang xử lý..." : "Trực tuyến"}</span>
          </div>
        </div>

        <div className="chatbot-header-actions">
          <button
            className="chatbot-header-btn"
            onClick={clearCurrentSession}
            title="Cuộc hội thoại mới">
            <PlusIcon className="w-7 h-7" />
          </button>
          <button className="chatbot-header-btn close-btn" onClick={onClose} title="Đóng">
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="chatbot-messages">
        <div className="chatbot-messages-content">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}

          {/* Auto scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Replies */}
      <QuickReplies onQuickReply={handleQuickReply} isDisabled={isLoading} />

      {/* Input Area */}
      <div className="chatbot-input">
        <div className="chatbot-input-container">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="chatbot-input-field"
            rows={1}
            maxLength={1000}
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="chatbot-send-btn"
            title="Gửi tin nhắn">
            <PaperAirplaneIcon className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
