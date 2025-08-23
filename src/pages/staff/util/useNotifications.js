import { useState, useCallback, useEffect } from "react";
import { playNotificationSoundByType, isAudioEnabled } from "./notificationSound";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isShaking, setIsShaking] = useState(false);

  // Tự động dừng shake sau 3 giây
  useEffect(() => {
    if (isShaking) {
      const timer = setTimeout(() => {
        setIsShaking(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isShaking]);

  const addNewOrderNotification = useCallback((orderData) => {
    const notification = {
      id: `new_order_${Date.now()}`,
      type: "NEW_ORDER",
      title: "Đơn hàng mới!",
      message: `Đơn hàng #${orderData.orderCode} từ ${orderData.receiverName}`,
      orderData: orderData,
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [notification, ...prev]);
    setIsShaking(true);

    // Phát âm thanh nếu được bật
    const audioPermissionGranted = localStorage.getItem("audioPermissionGranted") === "true";
    if (audioPermissionGranted && isAudioEnabled()) {
      console.log("Playing new order notification sound...");
      playNotificationSoundByType("NEW_ORDER").catch((err) => {
        console.error("Failed to play notification sound:", err);
      });
    } else {
      console.log("Audio not enabled or permission not granted");
    }
  }, []);

  const addOrderStatusNotification = useCallback((orderData, oldStatus, newStatus) => {
    const notification = {
      id: `status_update_${Date.now()}`,
      type: "ORDER_STATUS_UPDATE",
      title: "Cập nhật đơn hàng",
      message: `Đơn hàng #${orderData.orderCode} từ ${oldStatus} → ${newStatus}`,
      orderData: orderData,
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [notification, ...prev]);

    // Phát âm thanh nhẹ cho status update
    const audioPermissionGranted = localStorage.getItem("audioPermissionGranted") === "true";
    if (audioPermissionGranted && isAudioEnabled()) {
      console.log("Playing status update notification sound...");
      playNotificationSoundByType("ORDER_STATUS_UPDATE").catch((err) => {
        console.error("Failed to play status update sound:", err);
      });
    }
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const stopShaking = useCallback(() => {
    setIsShaking(false);
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setIsShaking(false);
  }, []);

  const removeNotification = useCallback((notificationId) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
  }, []);

  // Tính số lượng thông báo chưa đọc
  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isShaking,
    addNewOrderNotification,
    addOrderStatusNotification,
    markAsRead,
    stopShaking,
    clearAllNotifications,
    removeNotification,
  };
};
