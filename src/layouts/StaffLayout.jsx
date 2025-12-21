import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import BaseLayout from "./BaseLayout";
import { useStaffChatWebSocket } from "../hooks/useStaffChatWebSocket";
import CustomerChatPanel from "../pages/staff/chat/CustomerChatPanel";
import "../assets/styles/components/CustomerChatPanel.scss";

const StaffLayout = ({ children }) => {
  const { user: userFromRedux } = useSelector((state) => state.auth);

  // Sử dụng Staff Chat WebSocket hook
  const {
    connected: chatConnected,
    connecting: chatConnecting,
    error: chatError,
    addMessageHandler: addChatMessageHandler,
    sendMessageToCustomer,
    getOnlineStaff,
    service: chatService,
  } = useStaffChatWebSocket();

  // State cho Customer Chat Panel - load từ localStorage nếu có
  const [customerChatPanel, setCustomerChatPanel] = useState(() => {
    try {
      const savedState = localStorage.getItem("staff_chat_panel_state");
      const savedUnreadData = localStorage.getItem("staff_chat_unread_data");

      let initialState = {
        isOpen: true,
        isMinimized: true,
        unreadCount: 0,
      };

      if (savedState) {
        const parsed = JSON.parse(savedState);
        initialState = {
          isOpen: parsed.isOpen ?? true,
          isMinimized: parsed.isMinimized ?? true,
          unreadCount: parsed.unreadCount ?? 0,
        };
      }

      // Restore unread count từ localStorage nếu có và còn fresh (< 5 phút)
      if (savedUnreadData) {
        const unreadData = JSON.parse(savedUnreadData);
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (unreadData.timestamp && now - unreadData.timestamp < fiveMinutes) {
          initialState.unreadCount = Math.max(
            initialState.unreadCount,
            unreadData.totalUnread || 0
          );
        }
      }

      return initialState;
    } catch (error) {
      console.error("Lỗi khi load chat panel state từ localStorage:", error);
      return {
        isOpen: true,
        isMinimized: true,
        unreadCount: 0,
      };
    }
  });

  // Xử lý tin nhắn từ khách hàng
  const handleCustomerMessage = useCallback((messageData) => {
    const customerName =
      messageData.userName || messageData.customerName || messageData.userPhone || "Khách hàng";
    const messageText = messageData.message || messageData.content || "Tin nhắn mới";

    toast.info(`💬 ${customerName}: ${messageText.substring(0, 50)}...`, {
      position: "top-right",
      autoClose: 5000,
      onClick: () => {
        setCustomerChatPanel((prev) => ({
          ...prev,
          isOpen: true,
          isMinimized: false,
        }));
      },
    });
  }, []);

  // Xử lý các loại tin nhắn chat khác
  const handleChatError = useCallback((errorData) => {
    console.error("Lỗi chat:", errorData);
    toast.error(errorData.message || "Lỗi trong hệ thống chat");
  }, []);

  const handleOnlineStaffList = useCallback((staffList) => {}, []);

  // Handle unread count change từ chat panel
  const handleUnreadCountChange = useCallback((count) => {
    setCustomerChatPanel((prev) => ({ ...prev, unreadCount: count }));
  }, []);

  // Lưu chat panel state vào localStorage mỗi khi thay đổi
  useEffect(() => {
    if (customerChatPanel) {
      try {
        localStorage.setItem("staff_chat_panel_state", JSON.stringify(customerChatPanel));
      } catch (error) {
        console.error("Lỗi khi lưu chat panel state:", error);
      }
    }
  }, [customerChatPanel]);

  // Load initial unread count khi component mount
  useEffect(() => {
    const loadInitialUnreadCount = async () => {
      try {
        const { chatApi } = await import("../services/api/chatApi");
        const totalUnreadCount = await chatApi.getStaffUnreadCount();
        setCustomerChatPanel((prev) => {
          return { ...prev, unreadCount: totalUnreadCount };
        });
      } catch (error) {
        console.error("Lỗi khi load initial unread count:", error);
      }
    };

    if (userFromRedux) {
      loadInitialUnreadCount();
    }
  }, [userFromRedux]);

  // Handle chat panel minimize/expand
  const handleChatPanelMinimize = useCallback(() => {
    setCustomerChatPanel((prev) => ({
      ...prev,
      isMinimized: !prev.isMinimized,
      isOpen: true,
    }));
  }, []);

  // Setup Chat WebSocket handlers
  useEffect(() => {
    if (chatConnected && addChatMessageHandler) {
      const unsubscribeCustomerMessage = addChatMessageHandler(
        "customerMessage",
        handleCustomerMessage
      );
      const unsubscribeUserChatMessage = addChatMessageHandler(
        "userChatMessage",
        handleCustomerMessage
      );
      const unsubscribeChatError = addChatMessageHandler("chatError", handleChatError);
      const unsubscribeOnlineStaff = addChatMessageHandler(
        "onlineStaffList",
        handleOnlineStaffList
      );

      return () => {
        unsubscribeCustomerMessage?.();
        unsubscribeUserChatMessage?.();
        unsubscribeChatError?.();
        unsubscribeOnlineStaff?.();
      };
    }
  }, [
    chatConnected,
    addChatMessageHandler,
    handleCustomerMessage,
    handleChatError,
    handleOnlineStaffList,
  ]);

  // Cấu hình header gradient cho Staff
  const staffHeaderGradient = {
    background:
      "linear-gradient(90deg, rgba(228, 233, 230, 0.95) 0%, rgba(34, 197, 94, 0.90) 60%, rgba(255, 255, 255, 0.15) 100%)",
    boxShadow: "0 4px 20px 0 rgba(22, 163, 74, 0.15), 0 2px 0 0 #16a34a",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
  };

  return (
    <BaseLayout
      title="Quản lý nhà hàng"
      subtitle="Hệ thống quản lý Đồng Xanh"
      headerGradient={staffHeaderGradient}>
      {children}

      {/* Customer Chat Panel - Hiển thị ở tất cả các trang Staff */}
      <CustomerChatPanel
        isOpen={customerChatPanel.isOpen}
        isMinimized={customerChatPanel.isMinimized}
        onMinimize={handleChatPanelMinimize}
        onUnreadCountChange={handleUnreadCountChange}
        staffWebSocketClient={chatService}
        isConnected={chatConnected}
        serverUnreadCount={customerChatPanel.unreadCount}
      />
    </BaseLayout>
  );
};

export default StaffLayout;
