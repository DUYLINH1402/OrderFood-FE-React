/**
 * Custom hook để quản lý notifications cho NotificationBell component
 * Tích hợp với WebSocket và localStorage
 */

import { useState, useEffect, useCallback } from "react";
import {
  createNotificationFromSocket,
  isHighPriorityNotification,
} from "../utils/notificationUtils";

const useNotifications = (storageKey = "notifications", audioKey = "notificationAudio") => {
  const [notifications, setNotifications] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isShaking, setIsShaking] = useState(false);

  // Load notifications từ localStorage khi component mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem(storageKey);
    const savedAudioSetting = localStorage.getItem(audioKey);

    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (error) {
        console.error("Error loading saved notifications:", error);
      }
    }

    if (savedAudioSetting !== null) {
      setAudioEnabled(JSON.parse(savedAudioSetting));
    }
  }, [storageKey, audioKey]);

  // Lưu notifications vào localStorage khi có thay đổi
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notifications));
  }, [notifications, storageKey]);

  // Lưu audio setting
  useEffect(() => {
    localStorage.setItem(audioKey, JSON.stringify(audioEnabled));
  }, [audioEnabled, audioKey]);

  // Tính toán thống kê thông báo
  const unreadCount = notifications.filter((n) => !n.read).length;
  const highPriorityUnreadCount = notifications.filter(
    (n) => !n.read && n.priority === "high"
  ).length;

  // Thêm notification mới từ WebSocket
  const addNotification = useCallback(
    (socketData) => {
      try {
        const notification = createNotificationFromSocket(socketData);

        setNotifications((prev) => {
          // Kiểm tra duplicate
          const exists = prev.some((n) => n.id === notification.id);
          if (exists) return prev;

          // Thêm notification mới lên đầu
          const newNotifications = [notification, ...prev];

          // Giới hạn số lượng notifications (giữ 50 notifications gần nhất)
          return newNotifications.slice(0, 50);
        });

        // Trigger animation cho notification mới
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 3000);

        // Phát âm thanh nếu được bật và là ưu tiên cao
        if (audioEnabled && isHighPriorityNotification(socketData.orderStatus)) {
          playNotificationSound();
        }

        // Hiển thị browser notification nếu được cho phép
        if (Notification.permission === "granted") {
          showBrowserNotification(notification);
        }

        return notification;
      } catch (error) {
        console.error("Error adding notification:", error);
        return null;
      }
    },
    [audioEnabled]
  );

  // Đánh dấu đã đọc
  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Xóa notification
  const removeNotification = useCallback((notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  // Xóa tất cả notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Toggle âm thanh
  const toggleAudio = useCallback((enabled) => {
    setAudioEnabled(enabled);
  }, []);

  // Yêu cầu quyền browser notification
  const requestNotificationPermission = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, []);

  // Phát âm thanh thông báo
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio("/notification-sound.mp3");
      audio.volume = 0.5;
      audio.play().catch(console.error);
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  }, []);

  // Hiển thị browser notification
  const showBrowserNotification = useCallback((notification) => {
    try {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.webp",
        tag: notification.id,
        requireInteraction: notification.priority === "high",
      });
    } catch (error) {
      console.error("Error showing browser notification:", error);
    }
  }, []);

  // Cleanup notifications cũ (gọi định kỳ)
  const cleanupOldNotifications = useCallback(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    setNotifications((prev) => prev.filter((n) => n.timestamp > thirtyDaysAgo));
  }, []);

  // Cleanup tự động khi component mount
  useEffect(() => {
    cleanupOldNotifications();

    // Cleanup định kỳ mỗi ngày
    const cleanupInterval = setInterval(cleanupOldNotifications, 24 * 60 * 60 * 1000);

    return () => clearInterval(cleanupInterval);
  }, [cleanupOldNotifications]);

  return {
    // State
    notifications,
    unreadCount,
    highPriorityUnreadCount,
    isShaking,
    audioEnabled,

    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    toggleAudio,
    requestNotificationPermission,
  };
};

export default useNotifications;
