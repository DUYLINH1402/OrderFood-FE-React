import { useState, useEffect, useCallback } from "react";
import {
  createNotificationSound,
  playNotificationSoundByType,
  requestAudioPermission,
  isAudioSupported,
  isAudioEnabled,
} from "../utils/notificationSound";

const NOTIFICATION_STORAGE_KEY = "user_notifications";
const MAX_NOTIFICATIONS = 50;
const SHAKE_DURATION = 1200;

export const useUserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Load notifications từ localStorage khi component mount
  useEffect(() => {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (stored) {
      try {
        const parsedNotifications = JSON.parse(stored);
        // Validate structure và filter out invalid notifications
        const validNotifications = parsedNotifications.filter(
          (n) => n && typeof n === "object" && n.id && n.timestamp
        );
        setNotifications(validNotifications);
      } catch (error) {
        console.error("Error loading notifications from localStorage:", error);
        // Clear corrupted data
        localStorage.removeItem(NOTIFICATION_STORAGE_KEY);
      }
    }

    // Check audio permission
    checkAudioPermission();
  }, []);

  // Check if audio is allowed
  const checkAudioPermission = () => {
    const enabled = localStorage.getItem("notification_audio_enabled") === "true";
    const audioSupported = isAudioSupported();
    setAudioEnabled(enabled && audioSupported);
  };

  // Enable/disable audio notifications
  const toggleAudio = useCallback(async (enabled) => {
    if (enabled && isAudioSupported()) {
      // Request audio permission khi enable
      const hasPermission = await requestAudioPermission();
      if (hasPermission) {
        setAudioEnabled(true);
        localStorage.setItem("notification_audio_enabled", "true");
      } else {
        console.warn("Cannot enable audio - permission denied");
        setAudioEnabled(false);
        localStorage.setItem("notification_audio_enabled", "false");
      }
    } else {
      setAudioEnabled(false);
      localStorage.setItem("notification_audio_enabled", "false");
    }
  }, []);

  // Save notifications to localStorage
  const saveNotifications = useCallback((newNotifications) => {
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(newNotifications));
    } catch (error) {
      console.error("Error saving notifications to localStorage:", error);
    }
  }, []);

  // Play notification sound using Web Audio API
  const playNotificationSound = useCallback(
    async (notificationType = "ORDER_STATUS_UPDATE") => {
      if (!audioEnabled || !isAudioSupported()) return;

      try {
        // Sử dụng âm thanh từ notificationSound.js
        if (notificationType === "NEW_ORDER") {
          await playNotificationSoundByType("NEW_ORDER");
        } else if (
          notificationType === "ORDER_CONFIRMED" ||
          notificationType === "ORDER_IN_DELIVERY" ||
          notificationType === "ORDER_COMPLETED"
        ) {
          await playNotificationSoundByType("ORDER_STATUS_UPDATE");
        } else if (notificationType === "SYSTEM_NOTIFICATION") {
          await playNotificationSoundByType("STATS_UPDATE");
        } else {
          // Default notification sound
          await createNotificationSound();
        }
      } catch (error) {
        console.error("Cannot play notification sound:", error);
      }
    },
    [audioEnabled]
  );

  // Show browser notification
  const showBrowserNotification = useCallback(
    (title, message, options = {}) => {
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          const notification = new Notification(title, {
            body: message,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            tag: "order-notification", // Prevent duplicate notifications
            requireInteraction: false,
            silent: !audioEnabled, // Để Web Audio API handle sound
            ...options,
          });

          // Auto close after 5 seconds
          setTimeout(() => {
            notification.close();
          }, 5000);

          return notification;
        } catch (error) {
          console.log("Browser notification failed:", error);
        }
      }
      return null;
    },
    [audioEnabled]
  );

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }, []);

  // Thêm thông báo mới
  const addNotification = useCallback(
    (notification) => {
      const newNotification = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: "medium",
        ...notification,
      };

      setNotifications((prev) => {
        // Kiểm tra duplicate dựa trên orderCode hoặc type + timestamp gần nhau
        const isDuplicate = prev.some(
          (n) =>
            n.orderData?.orderCode &&
            newNotification.orderData?.orderCode === n.orderData.orderCode &&
            n.type === newNotification.type &&
            Math.abs(
              new Date(n.timestamp).getTime() - new Date(newNotification.timestamp).getTime()
            ) < 5000
        );

        if (isDuplicate) {
          return prev;
        }
        const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
        saveNotifications(updated);
        return updated;
      });

      // Trigger visual effects
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), SHAKE_DURATION);

      // Play sound với type cụ thể
      playNotificationSound(notification.type);

      // Show browser notification
      showBrowserNotification(notification.title, notification.message, {
        data: { orderCode: notification.orderData?.orderCode },
        actions: notification.orderData ? [{ action: "view", title: "Xem đơn hàng" }] : undefined,
      });

      return newNotification;
    },
    [saveNotifications, playNotificationSound, showBrowserNotification]
  );

  // Các loại thông báo cụ thể cho đơn hàng
  const addOrderConfirmedNotification = useCallback(
    (orderData) => {
      return addNotification({
        type: "ORDER_CONFIRMED",
        title: "Đơn hàng đã được xác nhận",
        message: `Đơn hàng #${
          orderData.orderCode || orderData.id
        } đã được xác nhận và đang được chuẩn bị.`,
        orderData,
        priority: "high",
        category: "order_update",
      });
    },
    [addNotification]
  );

  const addOrderInDeliveryNotification = useCallback(
    (orderData) => {
      return addNotification({
        type: "ORDER_IN_DELIVERY",
        title: "Đơn hàng đang được giao",
        message: `Đơn hàng #${orderData.orderCode || orderData.id} đang trên đường giao đến bạn.`,
        orderData,
        priority: "high",
        category: "order_update",
      });
    },
    [addNotification]
  );

  const addOrderCompletedNotification = useCallback(
    (orderData) => {
      return addNotification({
        type: "ORDER_COMPLETED",
        title: "Đơn hàng đã hoàn thành",
        message: `Đơn hàng #${
          orderData.orderCode || orderData.id
        } đã được giao thành công. Cảm ơn bạn!`,
        orderData,
        priority: "medium",
        category: "order_update",
      });
    },
    [addNotification]
  );

  const addOrderCancelledNotification = useCallback(
    (orderData) => {
      return addNotification({
        type: "ORDER_CANCELLED",
        title: "Đơn hàng đã bị hủy",
        message: `Đơn hàng #${
          orderData.orderCode || orderData.id
        } đã bị hủy. Xin lỗi vì sự bất tiện này.`,
        orderData,
        priority: "high",
        category: "order_update",
      });
    },
    [addNotification]
  );

  // Thông báo hệ thống
  const addSystemNotification = useCallback(
    (notificationData) => {
      return addNotification({
        type: "SYSTEM_NOTIFICATION",
        title: notificationData.title || "Thông báo hệ thống",
        message: notificationData.message,
        priority: notificationData.priority || "low",
        category: "system",
      });
    },
    [addNotification]
  );

  // Đánh dấu một thông báo đã đọc
  const markAsRead = useCallback(
    (notificationId) => {
      setNotifications((prev) => {
        const updated = prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
        saveNotifications(updated);
        return updated;
      });
    },
    [saveNotifications]
  );

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // Xóa một thông báo
  const removeNotification = useCallback(
    (notificationId) => {
      setNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== notificationId);
        saveNotifications(updated);
        return updated;
      });
    },
    [saveNotifications]
  );

  // Xóa tất cả thông báo
  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(NOTIFICATION_STORAGE_KEY);
  }, []);

  // Xóa thông báo đã đọc cũ (hơn 7 ngày)
  const cleanupOldNotifications = useCallback(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    setNotifications((prev) => {
      const updated = prev.filter((n) => {
        const notificationDate = new Date(n.timestamp);
        return !n.read || notificationDate > sevenDaysAgo;
      });

      if (updated.length !== prev.length) {
        saveNotifications(updated);
      }

      return updated;
    });
  }, [saveNotifications]);

  // Auto cleanup mỗi khi component mount
  useEffect(() => {
    cleanupOldNotifications();

    // Set up periodic cleanup (mỗi giờ)
    const cleanupInterval = setInterval(cleanupOldNotifications, 60 * 60 * 1000);

    return () => clearInterval(cleanupInterval);
  }, [cleanupOldNotifications]);

  // Computed values
  const unreadCount = notifications.filter((n) => !n.read).length;
  const highPriorityUnreadCount = notifications.filter(
    (n) => !n.read && n.priority === "high"
  ).length;

  // Get notifications by category
  const getNotificationsByCategory = useCallback(
    (category) => {
      return notifications.filter((n) => n.category === category);
    },
    [notifications]
  );

  // Get recent notifications (last 24 hours)
  const getRecentNotifications = useCallback(() => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return notifications.filter((n) => new Date(n.timestamp) > oneDayAgo);
  }, [notifications]);

  // Test audio function
  const testAudio = useCallback(async () => {
    if (audioEnabled) {
      await createNotificationSound();
    }
  }, [audioEnabled]);

  return {
    // State
    notifications,
    unreadCount,
    highPriorityUnreadCount,
    isShaking,
    audioEnabled,

    // Actions
    addOrderConfirmedNotification,
    addOrderInDeliveryNotification,
    addOrderCompletedNotification,
    addOrderCancelledNotification,
    addSystemNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    cleanupOldNotifications,

    // Utility functions
    getNotificationsByCategory,
    getRecentNotifications,
    requestNotificationPermission,
    toggleAudio,
    testAudio,

    // Manual shake trigger (for testing)
    triggerShake: () => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), SHAKE_DURATION);
    },

    // Audio status
    isAudioSupported: isAudioSupported(),
    isAudioActive: isAudioEnabled(),
  };
};
