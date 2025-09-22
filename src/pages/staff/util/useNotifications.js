import { useState, useCallback, useEffect } from "react";
// import { playNotificationSoundByType, isAudioEnabled } from "./notificationSound";
import { playNotificationSoundByType, isAudioEnabled } from "../../../utils/notificationSound";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Khởi tạo audio settings
  useEffect(() => {
    const checkAudioPermission = () => {
      const enabled = localStorage.getItem("staff_notification_audio_enabled") === "true";
      const audioSupported = isAudioEnabled();
      setAudioEnabled(enabled && audioSupported);
    };

    checkAudioPermission();
  }, []);

  // Toggle audio function
  const toggleAudio = useCallback(async (enabled) => {
    try {
      if (enabled && isAudioEnabled()) {
        localStorage.setItem("staff_notification_audio_enabled", "true");
        setAudioEnabled(true);
      } else {
        localStorage.setItem("staff_notification_audio_enabled", "false");
        setAudioEnabled(false);
      }
    } catch (error) {
      console.error("Error toggling audio:", error);
      setAudioEnabled(false);
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    try {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        return permission === "granted";
      }
      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, []);

  // Play sound when notification is added
  const playNotificationSound = useCallback(
    (type) => {
      if (audioEnabled) {
        playNotificationSoundByType(type);
      }
    },
    [audioEnabled]
  );

  // Tự động dừng shake sau 3 giây
  useEffect(() => {
    if (isShaking) {
      const timer = setTimeout(() => {
        setIsShaking(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isShaking]);

  const addNewOrderNotification = useCallback(
    (orderData) => {
      const notification = {
        id: `new_order_${Date.now()}`,
        type: "NEW_ORDER",
        title: "Đơn hàng mới!",
        message: `Đơn hàng #${orderData.orderCode} từ ${orderData.receiverName}`,
        orderData: orderData,
        timestamp: new Date(),
        read: false,
        priority: "high", // Đơn hàng mới có độ ưu tiên cao
      };

      setNotifications((prev) => [notification, ...prev]);
      setIsShaking(true);

      // Play notification sound
      playNotificationSound("NEW_ORDER");
    },
    [playNotificationSound]
  );

  const addOrderStatusNotification = useCallback(
    (orderData, oldStatus, newStatus) => {
      const notification = {
        id: `status_update_${Date.now()}`,
        type: "ORDER_STATUS_UPDATE",
        title: "Cập nhật đơn hàng",
        message: `Đơn hàng #${orderData.orderCode} từ ${oldStatus} → ${newStatus}`,
        orderData: orderData,
        timestamp: new Date(),
        read: false,
        priority: "medium",
      };

      setNotifications((prev) => [notification, ...prev]);

      // Play notification sound
      playNotificationSound("ORDER_STATUS_UPDATE");
    },
    [playNotificationSound]
  );

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
  const highPriorityUnreadCount = notifications.filter(
    (n) => !n.read && n.priority === "high"
  ).length;

  return {
    notifications,
    unreadCount,
    highPriorityUnreadCount,
    isShaking,
    audioEnabled,
    addNewOrderNotification,
    addOrderStatusNotification,
    markAsRead,
    stopShaking,
    clearAllNotifications,
    removeNotification,
    toggleAudio,
    requestNotificationPermission,
  };
};
