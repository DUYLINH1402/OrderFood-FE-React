import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import "../../assets/styles/components/SupportFloating.scss";
import Chatbot from "../Chatbot/Chatbot";
import StaffChat from "./StaffChat";
import { ChatBubbleLeftRightIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { toast } from "react-toastify";
import { useUserChat } from "../../hooks/useUserChat";

const SupportFloating = () => {
  // Lấy thông tin user để kiểm tra role
  const user = useSelector((state) => state.auth.user);

  // Không hiển thị SupportFloating cho Staff và Admin
  if (user?.roleCode === "ROLE_STAFF" || user?.roleCode === "ROLE_ADMIN") {
    return null;
  }

  // Lấy unread count và markAllAsRead từ useUserChat hook
  const { unreadCount, markAllAsRead } = useUserChat();

  // State để quản lý hiển thị Chatbot
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // State để quản lý hiển thị Staff Chat
  const [isStaffChatOpen, setIsStaffChatOpen] = useState(false);

  // Refs để theo dõi các element
  const chatbotWrapperRef = useRef(null);
  const staffChatWrapperRef = useRef(null);

  // State để theo dõi click cuối cùng cho double-click detection
  const [lastChatbotClickTime, setLastChatbotClickTime] = useState(0);

  // useEffect để xử lý click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Đóng chatbot nếu click ra ngoài
      if (
        chatbotWrapperRef.current &&
        !chatbotWrapperRef.current.contains(event.target) &&
        isChatbotOpen
      ) {
        setIsChatbotOpen(false);
      }

      // Đóng staff chat nếu click ra ngoài
      if (
        staffChatWrapperRef.current &&
        !staffChatWrapperRef.current.contains(event.target) &&
        isStaffChatOpen
      ) {
        setIsStaffChatOpen(false);
      }
    };

    // Thêm event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isChatbotOpen, isStaffChatOpen]);

  // Hàm xử lý double-click cho chatbot
  const handleChatbotClick = () => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastChatbotClickTime;

    // Nếu click trong vòng 300ms thì coi là double-click
    if (timeDiff < 300 && isChatbotOpen) {
      setIsChatbotOpen(false);
    } else {
      setIsChatbotOpen(!isChatbotOpen);
    }

    setLastChatbotClickTime(currentTime);
  };

  // Hàm xử lý khi nhấn vào các lựa chọn hỗ trợ
  const handleSupportOptionClick = (option) => {
    if (option === "staff") {
      // Toggle hiển thị Staff Chat
      const willOpen = !isStaffChatOpen;
      setIsStaffChatOpen(willOpen);

      // Đánh dấu tất cả tin nhắn đã đọc khi mở chat
      if (willOpen && unreadCount > 0) {
        markAllAsRead();
      }

      // Đóng chatbot nếu đang mở
      if (isChatbotOpen) setIsChatbotOpen(false);
    } else if (option === "phone") {
      // Gọi điện thoại hotline nhà hàng
      const phoneNumber = "tel:19000000"; // Thay số điện thoại thực của nhà hàng
      window.location.href = phoneNumber;
      toast.success("Đang mở ứng dụng gọi điện...");
    } else if (option === "messenger") {
      // Mở Facebook Messenger
      window.open("https://m.me/foodorderpage", "_blank");
    }
  };

  return (
    <>
      {/* Hiển thị Chatbot với class active dựa trên state isChatbotOpen */}
      <div ref={chatbotWrapperRef} className={`chatbot-wrapper ${isChatbotOpen ? "active" : ""}`}>
        <Chatbot onClose={() => setIsChatbotOpen(false)} />
      </div>

      {/* Hiển thị Staff Chat với class active dựa trên state isStaffChatOpen */}
      <div
        ref={staffChatWrapperRef}
        className={`staff-chat-wrapper ${isStaffChatOpen ? "active" : ""}`}>
        <StaffChat onClose={() => setIsStaffChatOpen(false)} />
      </div>

      {/* Support Floating Button */}
      <div className="support__icon fixed bottom-6 right-6 z-50">
        <div className="support-wrapper">
          <DotLottieReact
            title="Chat với AI"
            src="https://lottie.host/6979fcb6-f113-4562-bd2b-7086d19a7ace/WFs0aWXiG2.lottie"
            loop
            autoplay
            className="chatbot"
            onClick={handleChatbotClick}
          />

          {/* Hiển thị luôn 2 options hỗ trợ */}
          <div className="support-options">
            <div
              className="support-option staff"
              title="Chat với nhân viên"
              onClick={() => handleSupportOptionClick("staff")}>
              <ChatBubbleLeftRightIcon className="w-8 h-8" />
              {/* Hiển thị unread badge khi có tin nhắn chưa đọc */}
              {unreadCount > 0 && !isStaffChatOpen && (
                <span className="unread-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
              )}
            </div>
            <div
              className="support-option phone"
              onClick={() => handleSupportOptionClick("phone")}
              title="Liên hệ qua phone">
              <PhoneIcon className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupportFloating;
