import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import "../../assets/styles/components/SupportFloating.scss";
import Chatbot from "../Chatbot/Chatbot";
import StaffChat from "./StaffChat";
import { ChatBubbleLeftRightIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { FaFacebookMessenger } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeadset } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const SupportFloating = () => {
  // Lấy thông tin user để kiểm tra role
  const user = useSelector((state) => state.auth.user);

  // Không hiển thị SupportFloating cho Staff và Admin
  if (user?.roleCode === "ROLE_STAFF" || user?.roleCode === "ROLE_ADMIN") {
    return null;
  }
  // State để quản lý hiển thị menu hỗ trợ
  const [isSupportMenuOpen, setIsSupportMenuOpen] = useState(false);

  // State để quản lý hiển thị Chatbot
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // State để quản lý hiển thị Staff Chat
  const [isStaffChatOpen, setIsStaffChatOpen] = useState(false);

  // Refs để theo dõi các element
  const supportWrapperRef = useRef(null);
  const chatbotWrapperRef = useRef(null);
  const staffChatWrapperRef = useRef(null);

  // State để theo dõi click cuối cùng cho double-click detection
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastChatbotClickTime, setLastChatbotClickTime] = useState(0);

  // useEffect để xử lý click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Đóng support menu nếu click ra ngoài
      if (
        supportWrapperRef.current &&
        !supportWrapperRef.current.contains(event.target) &&
        isSupportMenuOpen
      ) {
        setIsSupportMenuOpen(false);
      }

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
  }, [isSupportMenuOpen, isChatbotOpen, isStaffChatOpen]);

  // Hàm xử lý double-click cho staff support
  const handleStaffSupportClick = () => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;

    // Nếu click trong vòng 300ms thì coi là double-click
    if (timeDiff < 300 && isSupportMenuOpen) {
      setIsSupportMenuOpen(false);
    } else {
      setIsSupportMenuOpen(!isSupportMenuOpen);
    }

    setLastClickTime(currentTime);
  };

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
    if (option === "chatbot") {
      // Toggle hiển thị Chatbot
      setIsChatbotOpen(!isChatbotOpen);
      // Đóng staff chat nếu đang mở
      if (isStaffChatOpen) setIsStaffChatOpen(false);
    } else if (option === "staff") {
      // Toggle hiển thị Staff Chat
      setIsStaffChatOpen(!isStaffChatOpen);
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
    setIsSupportMenuOpen(false); // Đóng menu sau khi chọn
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
        <div ref={supportWrapperRef} className="support-wrapper ">
          <div className="staff__support">
            <FontAwesomeIcon icon={faHeadset} title="Hỗ trợ" onClick={handleStaffSupportClick} />
          </div>
          <DotLottieReact
            title="Chat với AI"
            src="https://lottie.host/6979fcb6-f113-4562-bd2b-7086d19a7ace/WFs0aWXiG2.lottie"
            loop
            autoplay
            className="chatbot"
            onClick={handleChatbotClick}
          />

          {isSupportMenuOpen && (
            <div className="support-options">
              <div
                className="support-option staff"
                title="Chat với nhân viên"
                onClick={() => handleSupportOptionClick("staff")}>
                <ChatBubbleLeftRightIcon className="w-8 h-8" />
              </div>
              <div
                className="support-option phone"
                onClick={() => handleSupportOptionClick("phone")}
                title="Liên hệ qua phone">
                <PhoneIcon className="w-8 h-8" />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SupportFloating;
