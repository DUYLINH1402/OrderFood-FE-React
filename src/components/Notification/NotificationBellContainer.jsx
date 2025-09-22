import React, { useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import NotificationBell from "./NotificationBell";
import { useUserNotifications } from "../../hooks/useUserNotifications";
import userWebSocketClient from "../../services/websocket/userWebSocketClient";

/**
 * NotificationBellContainer - Container component tích hợp NotificationBell với API và WebSocket
 */
const NotificationBellContainer = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const {
    notifications,
    unreadCount,
    highPriorityUnreadCount,
    isShaking,
    audioEnabled,
    loading,
    addWebSocketNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    requestNotificationPermission,
    toggleAudio,
    loadNotificationsFromAPI,
  } = useUserNotifications();

  // Khởi tạo WebSocket connection khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Kết nối WebSocket
      userWebSocketClient.connect(user.id);

      // Đăng ký handler cho order updates
      const unsubscribeOrderUpdate = userWebSocketClient.addMessageHandler(
        "orderUpdate",
        handleWebSocketNotification
      );

      // Đăng ký handler cho notification updates
      const unsubscribeNotification = userWebSocketClient.addMessageHandler(
        "notification",
        handleWebSocketNotification
      );

      return () => {
        unsubscribeOrderUpdate();
        unsubscribeNotification();
        // Không disconnect WebSocket vì có thể được sử dụng ở chỗ khác
      };
    } else {
      // Nếu không đăng nhập, disconnect WebSocket
      userWebSocketClient.disconnect();
    }
  }, [isAuthenticated, user?.id]);

  // Handle WebSocket notification
  const handleWebSocketNotification = useCallback(
    (data) => {
      // Transform data thành notification format
      let notificationData;

      if (data.type === "raw" && data.message) {
        // Handle raw message format
        notificationData = {
          type: "SYSTEM_NOTIFICATION",
          title: "Thông báo hệ thống",
          message: data.message,
          timestamp: new Date().toISOString(),
        };
      } else if (data.orderData || data.orderId) {
        // Handle order update format
        notificationData = {
          type: data.type || data.eventType || "ORDER_UPDATE",
          title: getNotificationTitle(data.type || data.eventType),
          message: getNotificationMessage(data),
          orderData: data.orderData || {
            id: data.orderId,
            orderCode: data.orderCode,
            orderStatus: data.orderStatus,
            totalPrice: data.totalPrice,
            receiverName: data.receiverName,
          },
          timestamp: data.timestamp || new Date().toISOString(),
          priority: getPriorityFromType(data.type || data.eventType),
        };
      } else {
        // Handle general notification format
        notificationData = {
          type: data.type || "SYSTEM_NOTIFICATION",
          title: data.title || "Thông báo",
          message: data.message || "Bạn có thông báo mới",
          timestamp: data.timestamp || new Date().toISOString(),
          priority: data.priority || "medium",
        };
      }

      // Thêm notification vào hook
      addWebSocketNotification(notificationData);
    },
    [addWebSocketNotification]
  );

  // Get notification title based on type
  const getNotificationTitle = (type) => {
    const titleMap = {
      ORDER_CONFIRMED: "Đơn hàng đã được xác nhận",
      ORDER_PROCESSING: "Đơn hàng đang được chuẩn bị",
      ORDER_IN_DELIVERY: "Đơn hàng đã chuẩn bị xong",
      ORDER_DELIVERING: "Đơn hàng đang được giao",
      ORDER_COMPLETED: "Đơn hàng đã hoàn thành",
      ORDER_CANCELLED: "Đơn hàng đã bị hủy",
      SYSTEM_NOTIFICATION: "Thông báo hệ thống",
    };
    return titleMap[type] || "Cập nhật đơn hàng";
  };

  // Get notification message
  const getNotificationMessage = (data) => {
    const orderCode = data.orderCode || data.orderData?.orderCode || data.orderId;
    const type = data.type || data.eventType;

    const messageMap = {
      ORDER_CONFIRMED: `Đơn hàng #${orderCode} đã được xác nhận và đang được chuẩn bị.`,
      ORDER_PROCESSING: `Đơn hàng #${orderCode} đang được chuẩn bị.`,
      ORDER_IN_DELIVERY: `Đơn hàng #${orderCode} đã chuẩn bị xong! Vui lòng chờ nhận hàng.`,
      ORDER_DELIVERING: `Đơn hàng #${orderCode} đang trên đường giao đến bạn.`,
      ORDER_COMPLETED: `Đơn hàng #${orderCode} đã được giao thành công. Cảm ơn bạn!`,
      ORDER_CANCELLED: `Đơn hàng #${orderCode} đã bị hủy.`,
    };

    return data.message || messageMap[type] || `Đơn hàng #${orderCode} có cập nhật mới.`;
  };

  // Get priority from notification type
  const getPriorityFromType = (type) => {
    const highPriorityTypes = ["ORDER_CONFIRMED", "ORDER_IN_DELIVERY", "ORDER_CANCELLED"];
    return highPriorityTypes.includes(type) ? "high" : "medium";
  };

  // Handle manual refresh notifications
  const handleRefreshNotifications = useCallback(async () => {
    if (isAuthenticated && user?.id) {
      await loadNotificationsFromAPI();
    }
  }, [isAuthenticated, user?.id, loadNotificationsFromAPI]);

  // Auto refresh notifications when user comes back online
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && user?.id) {
        // Delay một chút để đảm bảo network đã stable
        setTimeout(handleRefreshNotifications, 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [handleRefreshNotifications, isAuthenticated, user?.id]);

  return (
    <NotificationBell
      notifications={notifications}
      unreadCount={unreadCount}
      highPriorityUnreadCount={highPriorityUnreadCount}
      isShaking={isShaking}
      audioEnabled={audioEnabled}
      loading={loading}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onRemoveNotification={removeNotification}
      onClearAll={clearAll}
      onToggleAudio={toggleAudio}
      onRequestPermission={requestNotificationPermission}
      onRefreshNotifications={handleRefreshNotifications}
    />
  );
};

export default NotificationBellContainer;
