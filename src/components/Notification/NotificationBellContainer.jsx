import React, { useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import NotificationBell from "./NotificationBell";
import { useUserNotifications } from "../../hooks/useUserNotifications";
import { useUserWebSocketContext } from "../../services/websocket/UserWebSocketProvider";
import userWebSocketClient from "../../services/websocket/userWebSocketClient";

/**
 * NotificationBellContainer - Container component tích hợp NotificationBell với API và WebSocket
 * Sử dụng UserWebSocketContext để quản lý WebSocket connection
 * Đăng ký trực tiếp vào userWebSocketClient để đảm bảo nhận được messages
 */
const NotificationBellContainer = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Sử dụng WebSocket context thay vì kết nối trực tiếp
  const wsContext = useUserWebSocketContext();

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

  // Ref để giữ reference ổn định của addWebSocketNotification
  const addWebSocketNotificationRef = useRef(addWebSocketNotification);
  useEffect(() => {
    addWebSocketNotificationRef.current = addWebSocketNotification;
  }, [addWebSocketNotification]);

  // Get notification title based on type
  const getNotificationTitle = useCallback((type) => {
    const titleMap = {
      // Backend messageType formats
      CUSTOMER_ORDER_UPDATE: "Cập nhật đơn hàng",
      ORDER_STATUS_CHANGED: "Trạng thái đơn hàng thay đổi",
      NEW_ORDER: "Đơn hàng mới",
      // Frontend type formats
      ORDER_CONFIRMED: "Đơn hàng đã được xác nhận",
      ORDER_PROCESSING: "Đơn hàng đang được chuẩn bị",
      ORDER_IN_DELIVERY: "Đơn hàng đã chuẩn bị xong",
      ORDER_DELIVERING: "Đơn hàng đang được giao",
      ORDER_COMPLETED: "Đơn hàng đã hoàn thành",
      ORDER_CANCELLED: "Đơn hàng đã bị hủy",
      SYSTEM_NOTIFICATION: "Thông báo hệ thống",
    };
    return titleMap[type] || "Cập nhật đơn hàng";
  }, []);

  // Get notification message
  const getNotificationMessage = useCallback((data) => {
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
  }, []);

  // Get priority from notification type
  const getPriorityFromType = useCallback((type) => {
    const highPriorityTypes = ["ORDER_CONFIRMED", "ORDER_IN_DELIVERY", "ORDER_CANCELLED"];
    return highPriorityTypes.includes(type) ? "high" : "medium";
  }, []);

  // Handle WebSocket notification - sử dụng ref để tránh re-registration
  const handleWebSocketNotification = useCallback(
    (data) => {
      // Transform data thành notification format
      let notificationData;

      // Lấy type từ data - backend có thể gửi messageType hoặc type
      const messageType = data.messageType || data.type || data.eventType;

      if (data.type === "raw" && data.message) {
        // Handle raw message format
        notificationData = {
          type: "SYSTEM_NOTIFICATION",
          title: "Thông báo hệ thống",
          message: data.message,
          timestamp: new Date().toISOString(),
        };
      } else if (data.orderId || data.orderCode || data.orderData) {
        // Handle order update format - check orderId/orderCode thay vì chỉ orderData
        notificationData = {
          type: messageType || "ORDER_UPDATE",
          title: getNotificationTitle(messageType),
          message: data.message || getNotificationMessage(data),
          orderData: data.orderData || {
            id: data.orderId,
            orderCode: data.orderCode,
            orderStatus: data.orderStatus,
            totalPrice: data.totalAmount || data.totalPrice,
            receiverName: data.receiverName || data.customerName,
          },
          timestamp: data.timestamp
            ? new Date(data.timestamp).toISOString()
            : new Date().toISOString(),
          priority: getPriorityFromType(messageType),
        };
      } else {
        // Handle general notification format
        notificationData = {
          type: messageType || "SYSTEM_NOTIFICATION",
          title: data.title || "Thông báo",
          message: data.message || "Bạn có thông báo mới",
          timestamp: new Date().toISOString(),
          priority: data.priority || "medium",
        };
      }

      // Thêm notification vào hook - sử dụng ref
      addWebSocketNotificationRef.current(notificationData);
    },
    [getNotificationTitle, getNotificationMessage, getPriorityFromType]
  );

  // Đăng ký trực tiếp vào userWebSocketClient để đảm bảo nhận được messages
  // Sử dụng addEventListener thay vì addMessageHandler để bypass timing issues
  useEffect(() => {
    // Đăng ký event listener trực tiếp vào client singleton
    const removeOrderUpdateListener = userWebSocketClient.addEventListener(
      "orderUpdate",
      handleWebSocketNotification
    );

    const removeNotificationListener = userWebSocketClient.addEventListener(
      "notification",
      handleWebSocketNotification
    );

    return () => {
      if (removeOrderUpdateListener) removeOrderUpdateListener();
      if (removeNotificationListener) removeNotificationListener();
    };
  }, [handleWebSocketNotification]);

  // Đăng ký WebSocket message handlers khi user đăng nhập (backup method qua context)
  useEffect(() => {
    // WebSocket connection được quản lý bởi UserWebSocketProvider
    // Ở đây chỉ cần đăng ký handlers
    if (!isAuthenticated || !user?.id || !wsContext?.addMessageHandler) {
      return;
    }

    // Đăng ký handler cho order updates
    // addMessageHandler sẽ tự động xử lý duplicate và queued messages
    const unsubscribeOrderUpdate = wsContext.addMessageHandler(
      "orderUpdate",
      handleWebSocketNotification
    );

    // Đăng ký handler cho notification updates
    const unsubscribeNotification = wsContext.addMessageHandler(
      "notification",
      handleWebSocketNotification
    );

    return () => {
      if (unsubscribeOrderUpdate) unsubscribeOrderUpdate();
      if (unsubscribeNotification) unsubscribeNotification();
    };
  }, [
    isAuthenticated,
    user?.id,
    wsContext?.addMessageHandler,
    wsContext?.connected,
    handleWebSocketNotification,
  ]);

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
