import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChatBubbleLeftRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  openChatbot,
  closeChatbot,
  selectIsOpen,
  selectUnreadCount,
} from "../../store/slices/chatbotSlice";
import Chatbot from "./Chatbot";

/**
 * Floating action button để mở/đóng chatbot
 * Component này sẽ được đặt ở layout chính của ứng dụng
 */
const ChatbotFAB = () => {
  const dispatch = useDispatch();
  const isChatbotOpen = useSelector(selectIsOpen);
  const unreadCount = useSelector(selectUnreadCount);

  const handleToggleChatbot = () => {
    if (isChatbotOpen) {
      dispatch(closeChatbot());
    } else {
      dispatch(openChatbot());
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="chatbot-fab-container">
        <button
          onClick={handleToggleChatbot}
          className={`chatbot-fab ${isChatbotOpen ? "chatbot-fab-open" : ""}`}
          title={isChatbotOpen ? "Đóng trợ lý" : "Mở trợ lý ảo"}>
          {isChatbotOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <>
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="chatbot-fab-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Chatbot Modal */}
      {isChatbotOpen && <Chatbot onClose={() => dispatch(closeChatbot())} />}
    </>
  );
};

export default ChatbotFAB;
